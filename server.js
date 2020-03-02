const express = require("express");
const next = require("next");
const fs = require("fs");
const { Pool } = require("pg");

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

const rawdata = fs.readFileSync("kunnat.json");
const kunnat = JSON.parse(rawdata);

const dev = process.env.NODE_ENV !== "production";
const port = process.env.NODE_ENV === "production" ? 80 : 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.get("/api/kunnat/:id", (req, res) => {
      const id = req.params.id;

      kunta = kunnat.find(el => {
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
        res.end(JSON.stringify(kunta));
      }

      return;
    });

    server.get("/api/kiinteistot/:id", (req, res) => {
      const id = req.params.id;
      pool.query(
        `
          SELECT 
            estate.*
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
              estate 
            ON 
              forest_data.standid = ANY(estate.standids) 
            WHERE 
              estate.id_text = $1::text 
            GROUP BY 
              forest_data.standid) AS forest_data
          JOIN 
            estate 
          ON 
            forest_data.standid = ANY(estate.standids) 
          WHERE 
            estate.id_text = $1::text 
          GROUP BY 
            estate.id_text;
        `,
        [id],
        (err, result) => {
          if (err) {
            res.status(500).end();
          } else {
            if (result.rowCount > 0) {
              res.status(200);
              res.end(JSON.stringify(result.rows[0]));
            } else {
              res.status(404).end();
            }
          }
        }
      );
      return;
    });

    server.post("/api/tilaus", (req, res) => {
      console.log(req);
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
