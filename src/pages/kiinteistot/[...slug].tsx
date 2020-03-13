import fetch from "isomorphic-unfetch";
import Head from "next/head";
import Boiler from "../../components/Boiler";
import NotFound from "../../components/NotFound";
import { forestryIndexes, subPages } from "../../utils";

const Estate = props => {
  return (
    <>
      <Head>
        <title>{props.data ? props.id : "Haku"} - Hiililaskuri</title>
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

const formatItemData = itemData => {
  const forecastVals = {};
  for (let key in forestryIndexes) {
    const fi = forestryIndexes[key];
    forecastVals[fi] = {
      CBT1: 0,
      Maa0: 0,
      Bio0: 0
    };
  }

  let forestHa = 0;
  let forecastHa = 0;

  const uniques = [];

  itemData.areas.forEach(area => {
    if (!uniques.includes(area.standid)) {
      uniques.push(area.standid);
      forestHa += area.area;

      itemData.forest_data.forEach(farea => {
        if ("" + area.standid === farea.standid) {
          forecastHa += area.area;

          for (let key in forestryIndexes) {
            const fi = forestryIndexes[key];

            for (let i = 0; i < farea.forecast_data.length; i++) {
              const fc = farea.forecast_data[i];
              if (fc.fc_type === fi) {
                for (let a in forecastVals[fi]) {
                  forecastVals[fi][a] += fc[a.toLowerCase()] * area.area;
                }
              }
            }
          }
        }
      });
    }
  });

  const data = {
    title: itemData.id_text,
    areaHa: itemData.area,
    forestHa,
    forecastHa: forecastHa,
    forecastVals: forecastVals,
    coordinates: itemData.coordinates
  };

  return data;
};

const formatCompareData = comparisonData => {
  const forecastVals = {};

  for (let key in forestryIndexes) {
    const fi = forestryIndexes[key];
    const forecast = {
      CBT1: comparisonData.forecast_data[fi].CBT1,
      Maa0: comparisonData.forecast_data[fi].Maa0,
      Bio0: comparisonData.forecast_data[fi].Bio0
    };
    forecastVals[fi] = forecast;
  }

  const data = {
    title: comparisonData.NAMEFIN,
    areaHa: comparisonData.TOTALAREA * 100,
    forestHa: comparisonData.forest_area,
    forecastHa: comparisonData.forest_area - comparisonData.non_forecasted_area,
    forecastVals: forecastVals
  };

  return data;
};

Estate.getInitialProps = async req => {
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

    data = formatItemData(json.kiinteisto);

    if (json.kunta) {
      comparisonData = formatCompareData(json.kunta);
    }
  }

  return { data, comparisonData, subPage, id, type: "estate", redirect };
};

export default Estate;
