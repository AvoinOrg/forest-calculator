import fetch from "isomorphic-unfetch";
import Head from "next/head";
import Boiler from "../../components/Boiler";
import NotFound from "../../components/NotFound";
import { forestryIndexes, subPages } from "../../utils";

const Municipality = props => {
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
        <NotFound text="Kuntaa" id={props.id} />
      )}
    </>
  );
};

const formatItemData = itemData => {
  const forecastVals = {};

  for (let key in forestryIndexes) {
    const fi = forestryIndexes[key];
    const forecast = {
      CBT1: itemData.forecast_data[fi].CBT1,
      Maa1: itemData.forecast_data[fi].Maa1,
      Bio1: itemData.forecast_data[fi].Bio1
    };
    forecastVals[fi] = forecast;
  }

  const data = {
    title: itemData.NAMEFIN,
    areaHa: itemData.TOTALAREA * 100,
    forestHa: itemData.forest_area,
    forecastHa: itemData.forest_area - itemData.non_forecasted_area,
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
      Maa1: comparisonData.forecast_data[fi].Maa1,
      Bio1: comparisonData.forecast_data[fi].Bio1
    };
    forecastVals[fi] = forecast;
  }

  const data = {
    title: comparisonData.MAAKUNTANIMIFI,
    areaHa: comparisonData.TOTALAREA * 100,
    forestHa: comparisonData.forest_area,
    forecastHa: comparisonData.forest_area - comparisonData.non_forecasted_area,
    forecastVals: forecastVals
  };

  return data;
};

Municipality.getInitialProps = async req => {
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

  const res = await fetch(process.env.API_URL + "/kunnat/" + id);

  let data = null;
  let comparisonData = null;

  if (res.status === 200) {
    const json = await res.json();
    
    data = formatItemData(json.kunta);

    if (json.maakunta) {
      comparisonData = formatCompareData(json.maakunta);
    }
  }

  return { data, comparisonData, subPage, id, redirect, type: "municipality" };
};

export default Municipality;
