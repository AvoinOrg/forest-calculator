const express = require("express");
const next = require("next");
const fs = require("fs");

const rawdata = fs.readFileSync("kunnat.json");
const kunnat = JSON.parse(rawdata);

const dev = process.env.NODE_ENV !== "production";
const port = process.env.NODE_ENV === "production" ? 80 : 3000
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
        res.status(404);
        return;
      }

      res.end(JSON.stringify(kunta));
      return;
    });

    server.get("/api/kiinteistot/", (req, res) => {
      const id = req.query.id;

      res.end("{null}");
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
