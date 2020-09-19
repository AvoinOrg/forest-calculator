const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");
const { v4 } = require("uuid");
const nodemailer = require("nodemailer");

require("dotenv").config();

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  database: process.env.PG_DBNAME,

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const parseRes = (status, resData) => ({
  status,
  resData,
});

const nmUser = process.env.NODEMAILER_USER;
const nmEmail = process.env.NODEMAILER_EMAIL;

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: nmUser,
    pass: process.env.NODEMAILER_PASS,
  },
});

let rawdata = fs.readFileSync("data/municipalities.json");
const municipalities = JSON.parse(rawdata);

rawdata = fs.readFileSync("data/provinces.json");
const provinces = JSON.parse(rawdata);

const getMunicipality = async (name) => {
  const n = name.trim().toLowerCase();
  const municipality = municipalities.find((el) => {
    if (el.NAMEFIN) {
      if (n === el.NAMEFIN.trim().toLowerCase()) {
        return true;
      }
    }

    return false;
  });

  if (!municipality) {
    return parseRes(404, null);
  } else {
    return parseRes(200, municipality);
  }
};

const getMunicipalityByNatCode = async (natCode) => {
  const nc = natCode.trim().toLowerCase();

  const municipality = municipalities.find((el) => {
    if (el.NATCODE) {
      if (nc === el.NATCODE.trim().toLowerCase()) {
        return true;
      }
    }

    return false;
  });

  if (!municipality) {
    return parseRes(404, null);
  } else {
    return parseRes(200, municipality);
  }
};

const getProvince = async (id) => {
  if (provinces[id]) {
    province = provinces[id];

    return parseRes(200, province);
  }

  return parseRes(404, null);
};

const getEstate = async (id) => {
  try {
    const { rows } = await pool.query(
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
      [id]
    );

    if (rows.length > 0) {
      return parseRes(200, rows[0]);
    } else {
      return parseRes(404, null);
    }
  } catch (err) {
    console.log(err);
    return parseRes(500, null);
  }
};

const sendOrder = async (data) => {
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
      data.orderType,
    ],
    (err) => {
      if (err) {
        console.log(err);
        return 500;
      } else {
        transporter
          .sendMail({
            from: `"Uusi tilaus - Hiililaskuri" <${forestUser}>`,
            to: nmEmail,
            subject: "Uusi tilaus: " + data.areaId,
            text: `
              Nimi: ${data.name}
              Email: ${data.email}
              Alueen tyyppi: ${data.areaType}
              Alueen nimi/tunnus: ${data.areaId}
              Tilauksen tyyppi: ${data.orderType}
              Ajankohta: ${new Date(date)}
            `,
          })
          .then((result) => console.log(result))
          .catch((error) => console.error(error));
        return 200;
      }
    }
  );
};

module.exports = { getEstate, getMunicipality, getMunicipalityByNatCode, getProvince, sendOrder };
