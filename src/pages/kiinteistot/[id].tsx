import fetch from "isomorphic-unfetch";

const Estate = props => {
  console.log(props.data);
  return (
    <>
      <h1>{"asdf"}</h1>
    </>
  );
};

Estate.getInitialProps = async req => {
  const id = req.query.id;
  const res = await fetch(process.env.API_URL + "/kiinteistot/" + id);

  if (res.status === 200) {
    const json = await res.json();
    return { data: json };
  }
  return { data: null };
};

export default Estate;
