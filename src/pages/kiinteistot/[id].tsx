import fetch from "isomorphic-unfetch";

const Estate = props => {
  const a = 0;
  return (
    <>
      <h1>{"asdf"}</h1>
    </>
  );
};

Estate.getInitialProps = async query => {
  const { id } = query;
  console.log(query)
  const res = await fetch("http://localhost:3000/api/kiinteistot");
  console.log(res);
  const json = await res.json();
  return { meem: "asdf" };
};

export default Estate;
