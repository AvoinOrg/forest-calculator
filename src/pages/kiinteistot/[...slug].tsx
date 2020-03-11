import fetch from "isomorphic-unfetch";
import Head from "next/head";
import Boiler from "../../components/Boiler";
import NotFound from "../../components/NotFound";
import { subPages } from "../../utils";

const Estate = props => {
  return (
    <>
      <Head>
        <title>{props.data ? props.id : "Haku"} - Hiililaskuri</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=yes"
        />
      </Head>
      {props.data ? (
        <Boiler
          data={props.data}
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

  let json = null;

  if (res.status === 200) {
    json = await res.json();
    json = formatData(json);
  }

  return { data: json, subPage, id, redirect };
};

const formatData = json => {
  let forestHa = 0;
  let forecastHa = 0;

  json.areas.forEach(area => {
    forestHa += area.area;

    json.forest_data.forEach(farea => {
      if ("" + area.standid === farea.standid) {
        forecastHa += area.ratio * area.area;
      }
    });
  });

  const data = {
    title: json["id_text"],
    areaHa: json["area"],
    forestHa,
    forecastHa
  };
};

export default Estate;
