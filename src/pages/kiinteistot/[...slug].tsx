import fetch from "isomorphic-unfetch";
import Head from "next/head";
import Boiler from "../../components/Boiler";
import NotFound from "../../components/NotFound";
import { forestryIndexes, subPages } from "../../utils";

import price_map from "../../public/prices.json";
import prov_map from "../../public/prov_mun.json";

const Estate = (props) => {
  return (
    <>
      <Head>
        <title>{props.data ? props.data.title : "Haku"} - Metsälaskuri</title>
        <meta name="viewport" />
      </Head>
      {props.data ? (
        <Boiler
          data={props.data}
          comparisonData={props.comparisonData}
          id={props.id}
          subPage={props.subPage}
          type={props.type}
          redirect={props.redirect}
        />
      ) : (
        <NotFound text="Kiinteistötunnusta" id={props.id} />
      )}
    </>
  );
};

const getPrices = (code) => {
  let val;
  let prices;
  try {
    val = prov_map.find((x) => x.kunta_koodi === code).maakunta_koodi;
    prices = price_map.filter((x) => x.Alueet.includes(val));
  } catch (err) {}

  if (!prices) prices = price_map.filter((x) => x.Alueet.includes("01"));

  const realPrices = {};
  for (const p of prices) {
    const avgT = (Number(p.Mat) + Number(p.Kut) + Number(p.Kot)) / 3;
    const avgK = (Number(p.Mak) + Number(p.Kuk) + Number(p.Kok)) / 3;
    realPrices[p.Hakkuutapa] = { Kuit: avgK, Tuk: avgT };
  }

  return realPrices;
};

const formatItemData = (itemData, prices) => {
  const forecastVals = {};
  const kasittelyVals = {};
  for (let key in forestryIndexes) {
    const fi = forestryIndexes[key];
    forecastVals[fi] = {
      P1: 0,
      P2: 0,
      P3: 0,
      P4: 0,
      P5: 0,
    };
  }

  let forestHa = 0;
  let forecastHa = 0;

  const uniques = [];

  itemData.areas.forEach((area) => {
    if (!uniques.includes(area.standid)) {
      uniques.push(area.standid);
      forestHa += area.area;

      itemData.forest_data.forEach((farea) => {
        if ("" + area.standid === farea.standid) {
          forecastHa += area.area;

          for (let key in forestryIndexes) {
            const fi = forestryIndexes[key];

            for (let i = 0; i < farea.forecast_data.length; i++) {
              const fc = farea.forecast_data[i];
              if (fc.fc_type === fi) {
                for (let x = 1; x <= 5; x++) {
                  let val = 0;
                  const kas = fc["k" + x];
                  const tuk = fc["tuk" + x];
                  const kuit = fc["kuit" + x];
                  if (kas !== "Ei käsitellä") {
                    if (["Istutus", "Koivun istutus"].includes(kas)) {
                      val += area.area * 675;
                    } else if (["Taimikonhoito"].includes(kas)) {
                      val += area.area * 600;
                    } else if (["Kylvö"].includes(kas)) {
                      val += area.area * 205;
                    } else if (["Varhaisperkaus"].includes(kas)) {
                      val += area.area * 350;
                    } else if (["Ensiharvennus"].includes(kas)) {
                      val += area.area * prices["Ensiharvennus"]["Tuk"] * tuk;
                      val += area.area * prices["Ensiharvennus"]["Kuit"] * kuit;
                    } else if (
                      [
                        "Avohakkuu",
                        "Ylispuiden poisto",
                        "Siemenpuuhakkuu",
                        "Avohakkuu säästöpuin",
                      ].includes(kas)
                    ) {
                      val += area.area * prices["Uudistushakkuu"]["Tuk"] * tuk;
                      val +=
                        area.area * prices["Uudistushakkuu"]["Kuit"] * kuit;
                    } else if (["Alaharvennus", ""].includes(kas)) {
                      val += area.area * prices["Harvennus"]["Tuk"] * tuk;
                      val += area.area * prices["Harvennus"]["Kuit"] * kuit;
                    }
                  }
                  forecastVals[fi]["P" + x] += val;
                }
              }
            }
          }
        }
      });
    }
  });

  if (itemData.inacc && forestHa > itemData.area) {
    const ratio = itemData.area / forestHa;
    forecastHa *= ratio / 2;
    forestHa = itemData.area;
    for (let k1 in forecastVals) {
      for (let k2 in forecastVals[k1]) {
        forecastVals[k1][k2] *= ratio;
      }
    }
  }

  const data = {
    title: itemData.id_text,
    areaHa: itemData.area,
    forestHa,
    forecastHa: forecastHa,
    forecastVals: forecastVals,
    kasittelyVals: kasittelyVals,
    coordinates: itemData.coordinates,
  };

  return data;
};

const getPrice = (comparisonData, year, prices) => {
  const kuit =
    Number(comparisonData.forecast_data[3]["Kuit" + year]) *
    prices["Harvennus"]["Kuit"];
  const tuk =
    Number(comparisonData.forecast_data[3]["Tuk" + year]) *
    prices["Harvennus"]["Tuk"];
  return tuk + kuit;
};

const formatCompareData = (comparisonData, prices) => {
  const forecastVals = {};

  const forecastHa =
    comparisonData.forest_area - comparisonData.non_forecasted_area;

  for (let key in forestryIndexes) {
    const fi = forestryIndexes[key];
    const forecast = {
      P1: getPrice(comparisonData, 1, prices),
      P2: getPrice(comparisonData, 2, prices),
      P3: getPrice(comparisonData, 2, prices),
      P4: getPrice(comparisonData, 3, prices),
      P5: getPrice(comparisonData, 5, prices),
    };
    forecastVals[fi] = forecast;
  }

  const data = {
    title: comparisonData.NAMEFIN,
    areaHa: comparisonData.TOTALAREA * 100,
    forestHa: comparisonData.forest_area,
    forecastHa: forecastHa,
    forecastVals: forecastVals,
  };

  return data;
};

Estate.getInitialProps = async (req) => {
  const id = req.query.slug[0];
  let subPage = null;
  let redirect = false;

  if (req.query.slug.length > 1) {
    const param = req.query.slug[1].toLowerCase();
    if (subPages.includes(param)) {
      subPage = param;
    }
  }

  if (!subPage) {
    subPage = subPages[0];

    if (req.query.slug.length > 1) {
      redirect = true;
    }
  }

  const res = await fetch(process.env.API_URL + "/kiinteistot/" + id);

  let data = null;
  let comparisonData = null;

  if (res.status === 200) {
    const json = await res.json();

    const prices = getPrices(json.kiinteisto["k_natcode"]);
    data = formatItemData(json.kiinteisto, prices);
    if (json.kunta) {
      comparisonData = formatCompareData(json.kunta, prices);
    }
  }

  return { data, comparisonData, subPage, id, type: "estate", redirect };
};

export default Estate;
