const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const serveIndex = require("serve-index");

const {
  getEstate,
  getMunicipality,
  getMunicipalityByNatCode,
  getProvince,
  sendOrder,
} = require("./data/data.js");

require("dotenv").config();

const dev = process.env.NODE_ENV !== "production";
const useHttps = process.env.HTTPS === "TRUE";
const port = !dev ? 80 : 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(bodyParser.json());
    server.use(bodyParser.raw());

    server.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });

    server.use(
      "/.well-known",
      express.static(".well-known"),
      serveIndex(".well-known", { icons: true })
    );

    server.get("/api/kunnat/:id", async (req, res) => {
      const id = req.params.id;

      const { status: munStatus, resData: munData } = await getMunicipality(id);

      let data = { kunta: munData, maakunta: null };

      if (munStatus === 200) {
        const { status: proStatus, resData: proData } = await getProvince(
          munData.MAAKUNTANRO
        );

        data.maakunta = proData;
      }

      res.status(munStatus).end(JSON.stringify(data));

      return;
    });

    server.get("/api/maakunnat/:id", async (req, res) => {
      const id = req.params.id;

      const { status, resData } = await getProvince(id);

      res.status(status).end(JSON.stringify(resData));
      return;
    });

    server.get("/api/kiinteistot/:id", async (req, res) => {
      const id = req.params.id;

      const { status: esStatus, resData: esData } = await getEstate(id);
      const data = { kiinteisto: esData, kunta: null };

      if (esStatus === 200) {
        const { resData: munData } = await getMunicipalityByNatCode(
          esData.k_natcode
        );

        data.kunta = munData;
      }

      res.status(esStatus).end(JSON.stringify(data));
      return;
    });

    server.post("/api/tilaus", async (req, res) => {
      data = req.body;
      const { status, resData } = await sendOrder(data);

      res.status(status).end(JSON.stringify(resData));
      return;
    });

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    if (useHttps) {
      const privateKey = fs.readFileSync(
        path.join(process.env.SSL_PATH, "privkey.pem"),
        "utf8"
      );
      const certificate = fs.readFileSync(
        path.join(process.env.SSL_PATH, "cert.pem"),
        "utf8"
      );
      const ca = fs.readFileSync(
        path.join(process.env.SSL_PATH, "chain.pem"),
        "utf8"
      );

      const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca,
      };

      const httpsServer = https.createServer(credentials, server);

      httpsServer.listen(443, (err) => {
        if (err) throw err;
        console.log("> Https ready on https://localhost:443");
      });
    }

    if (useHttps) {
      http
        .createServer((req, res) => {
          // 301 redirect (reclassifies google listings)
          res.writeHead(301, {
            Location: "https://" + req.headers["host"] + req.url,
          });
          res.end();
        })
        .listen(port, (err) => {
          if (err) throw err;
          console.log("> Redirection ready on http://localhost:" + port);
        });
    } else {
      const httpServer = http.createServer(server);
      httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log("> Ready on http://localhost:" + port);
      });
    }
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
