const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const fs = require("fs");
const { Pool } = require("pg");
const { v4 } = require("uuid");
const nodemailer = require("nodemailer");

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  database: process.env.PG_DBNAME,

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

let rawdata = fs.readFileSync("kunnat.json");
const kunnat = JSON.parse(rawdata);

rawdata = fs.readFileSync("maakunnat.json");
const maakunnat = JSON.parse(rawdata);

const dev = process.env.NODE_ENV !== "production";
const port = process.env.NODE_ENV === "production" ? 80 : 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FOREST_USER,
    pass: process.env.FOREST_PASS
  }
});

app
  .prepare()
  .then(() => {
    const server = express();
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(bodyParser.json());
    server.use(bodyParser.raw());

    server.get("/api/kunnat/:id", (req, res) => {
      const id = req.params.id;

      const kunta = kunnat.find(el => {
        if (el.NAMEFIN) {
          if (id.trim().toLowerCase() === el.NAMEFIN.trim().toLowerCase()) {
            return true;
          }
        }

        return false;
      });

      if (!kunta) {
        res.status(404).end();
      } else {
        res.status(200);

        let maakunta = null;
        if (maakunnat[kunta.MAAKUNTANRO]) {
          maakunta = maakunnat[kunta.MAAKUNTANRO];
        }

        const data = {
          kunta,
          maakunta
        };

        res.end(JSON.stringify(data));
      }

      return;
    });

    server.get("/api/maakunnat/:id", (req, res) => {
      const id = req.params.id;

      if (maakunnat[id]) {
        maakunta = maakunnat[id];
      }

      if (!maakunta) {
        res.status(404).end();
      } else {
        res.status(200);
        res.end(JSON.stringify(maakunta));
      }

      return;
    });

    server.get("/api/kiinteistot/:id", (req, res) => {
      const id = req.params.id;
      pool.query(
        `
          SELECT 
            estate3.*
            , jsonb_agg(forest_data.*)  as forest_data
          FROM (
            SELECT 
              forest_data.*
              , jsonb_agg(forecast_data) AS forecast_data 
            FROM 
              forest_data 
            JOIN 
              forecast_data 
            ON 
              forecast_data.id = ANY(forest_data.forecasts) 
            JOIN 
              estate3 
            ON 
              forest_data.standid = ANY(estate3.standids) 
            WHERE 
              estate3.id_text = $1::text 
            GROUP BY 
              forest_data.standid) AS forest_data
          JOIN 
            estate3 
          ON 
            forest_data.standid = ANY(estate3.standids) 
          WHERE 
            estate3.id_text = $1::text 
          GROUP BY 
            estate3.id_text;
        `,
        [id],
        (err, result) => {
          if (err) {
            console.log(err)
            res.status(500).end();
          } else {
            if (result.rowCount > 0) {
              res.status(200);

              let kunta = null;
              const kId = result.rows[0].k_natcode;

              if (kId) {
                kunta = kunnat.find(el => {
                  if (el.NATCODE) {
                    if (
                      kId.trim().toLowerCase() ===
                      el.NATCODE.trim().toLowerCase()
                    ) {
                      return true;
                    }
                  }

                  return false;
                });
              }

              const data = {
                kiinteisto: result.rows[0],
                kunta
              };

              res.end(JSON.stringify(data));
            } else {
              res.status(404).end();
            }
          }
        }
      );
      return;
    });

    server.post("/api/tilaus", (req, res) => {
      data = req.body;
      date = Date.now();
      pool.query(
        `
          INSERT INTO 
            customer_order(
              id,
              ts,
              customer_name,
              email,
              areaId,
              areaType,
              orderType
            )
          VALUES(
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )
        `,
        [
          v4(),
          date,
          data.name,
          data.email,
          data.areaId,
          data.areaType,
          data.orderType
        ],
        err => {
          if (err) {
            console.log(err);
            res.status(500).end();
          } else {
            transporter
              .sendMail({
                from: '"Hiililaskuri: tilaukset" <noreply@hiililaskuri.fi>',
                to: process.env.FOREST_EMAIL,
                subject: "Uusi tilaus: " + data.areaId,
                text: `
                  Nimi: ${data.name}
                  Email: ${data.email}
                  Alueen tyyppi: ${data.areaType}
                  Alueen nimi/tunnus: ${data.areaId}
                  Tilauksen tyyppi: ${data.orderType}
                  Ajankohta: ${new Date(date)}
                `
              })
              .then(stuff => console.log(stuff));
            res.status(200).end();
          }
        }
      );
      return;
    });

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(port, err => {
      if (err) throw err;
      console.log("> Ready on http://localhost:" + port);
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
