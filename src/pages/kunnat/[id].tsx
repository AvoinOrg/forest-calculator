import fetch from "isomorphic-unfetch";
import styled from "styled-components";
import { useEffect, useState } from "react";
import Head from "next/head";

import { Theme } from "../../styles";
import MunicipalityOutline from "../../components/MunicipalityOutline";
import StockChart from "../../components/StockChart";

const Municipality = props => {
  const [ready, setReady] = useState(false);

  const co2ekv = props.data.forecast_data[3].CBT1
    ? props.data.forecast_data[3].CBT1 / 10
    : 0;

  const stockAmounts = [
    props.data.forecast_data[4].Maa5 - props.data.forecast_data[3].Maa5,
    props.data.forecast_data[4].Bio5 - props.data.forecast_data[3].Bio5
  ];

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      <Head>
        <title>{props.data.NAMEFIN} - Arvometsä hiililaskuri</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
      </Head>
      {ready && (
        <Container>
          <Overlay>
            <GraphContainer>
              <MunOutlineContainer>
                <MunicipalityOutline coords={props.data.coordinates} />
              </MunOutlineContainer>
              <BalanceContainer>
                <BalanceCircle>
                  <BalanceValue>{co2ekv}</BalanceValue>
                  <BalanceUnit>
                    CO<sub>2</sub>
                  </BalanceUnit>
                </BalanceCircle>
              </BalanceContainer>
              <StockContainer>
                <StockChart
                  data1={[stockAmounts[0]]}
                  data2={[stockAmounts[1]]}
                />
              </StockContainer>
            </GraphContainer>
            <WaveContainer>
              <Wave />
            </WaveContainer>
          </Overlay>

          <TextContainer>
            <Title>{props.data.NAMEFIN}</Title>
            <InfoTextContainer>
              <InfoTextRowFirst>
                <InfoTextKey>Pinta-ala:&nbsp;&nbsp;</InfoTextKey>
                <InfoTextValue>
                  {roundVal(props.data.TOTALAREA) + "km"}
                  <sup>2</sup>
                </InfoTextValue>
              </InfoTextRowFirst>
              <InfoTextRow>
                <InfoTextKey>Metsää:&nbsp;&nbsp;</InfoTextKey>
                <InfoTextValue>
                  {roundVal(haToKm(props.data.forest_area)) + "km"}
                  <sup>2</sup>
                </InfoTextValue>
              </InfoTextRow>
              <InfoTextRow>
                <InfoTextKey>
                  Hiililaskelmien kattavuus:&nbsp;&nbsp;
                </InfoTextKey>
                <InfoTextValue>
                  {roundVal(
                    getRatio(
                      props.data.forest_area,
                      props.data.non_forecasted_area
                    )
                  ) + "%"}
                </InfoTextValue>
              </InfoTextRow>
            </InfoTextContainer>
            <ExplanationContainer>
              <ExplanationHeader>
                Vuotuinen hiilitase (CO-ekv)
              </ExplanationHeader>
              <ExplanationText>
                Hiilitase tarkoittaa metsätalouden sitoman ja vapauttaman hiilen
                erotusta tietyn ajanjakson kuluessa. Positiivinen tase
                tarkoittaa, että metsätalous on poistanut hiiltä ilmakehästä ja
                toiminut hiilinieluna. Hiilitaseessa otetaan huomioon myös
                puutuotteiden korvausvaikutukset.
                <br />
                <br />
                Vuoden 2020 hiilitase oli {co2ekv} hiilidioksiditonnia (CO2
                -ekv). Metsien vuotuinen hiilidioksidin nettosidonta vastaa
                yhteensä {Math.round(co2ekv / 10.3)} keskimääräisen suomalaisen
                ihmisen vuotuista hiilijalanjälkeä, joka on n. 10,3
                hiilidioksiditonnia (CO2 -ekv).
              </ExplanationText>
            </ExplanationContainer>
            <ExplanationContainer>
              <ExplanationHeader>
                Hiilivarastojen parannuspotentiaali (CO2-ekv)
              </ExplanationHeader>
              <ExplanationText>
                Puuston eli biomassan hiilitase kuvaa hiilen määrän muutosta
                metsä- ja kitumaalla kasvavassa puustossa. Biomassan
                hiilitaseeseen vaikuttavat tekijät ovat puuston kasvu, uusien
                puiden syntyminen, puiden kuoleminen (luonnonpoistuma) ja
                hakkuut.
                <br />
                <br />
                Maan hiilitase tarkoittaa metsämaan hiilivaraston muutosta,
                mihin vaikuttavat puiden kuoleminen, karikkeen ja
                hakkuutähteiden määrä, turvekerroksen paksuuntuminen
                ojittamattomilla soilla ja maan eloperäisen aineksen hajoaminen.
                <br />
                <br />
                Hiilivarastoja voisi potentiaalisesti parantaa{" "}
                {stockAmounts[0] + stockAmounts[1]} hiilidioksiditonnin (CO2
                -ekv) edestä 50 vuoden aikavälillä.
              </ExplanationText>
            </ExplanationContainer>
          </TextContainer>
        </Container>
      )}
    </>
  );
};

Municipality.getInitialProps = async req => {
  const id = req.query.id;
  const res = await fetch(process.env.API_URL + "/kunnat/" + id);
  const json = await res.json();
  return { data: json };
};

const roundVal = (val: number | string) => {
  if (typeof val === "string") {
    val = Number(val);
  }
  val = Math.round(val * 10) / 10;
  return val;
};

const haToKm = (val: number | string) => {
  if (typeof val === "string") {
    val = Number(val);
  }
  return val / 100;
};

const getRatio = (val1: number | string, val2: number | string) => {
  if (typeof val1 === "string") {
    val1 = Number(val1);
  }
  if (typeof val2 === "string") {
    val2 = Number(val2);
  }

  const ratio = Math.max(val1 - val2, 0.0001) / val1;
  return ratio * 100;
};

const Container: any = styled.div`
  background-image: url(${require("../../public/img/forest.jpg")});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex: 1;
`;

const GraphContainer: any = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: flex-end;
  padding: 100px 0 0 20px;
`;

const Overlay: any = styled.div`
  display: flex;
  flex: 1.4;
  flex-direction: row;
  background: rgba(49, 66, 52, 0.95);
`;

const MunOutlineContainer: any = styled.div`
  height: 220px;
  width: 300px;
  display: flex;
  justify-content: flex-end;
`;

const BalanceContainer: any = styled.div`
  height: 240px;
  width: 240px;
  margin: 110px 20px 0 0;
`;

const BalanceCircle: any = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  background: ${Theme.color.secondary};
  border-radius: 300px;
  align-items: center;
  justify-content: center;
`;

const BalanceValue: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  font-size: 3.5rem;
`;

const BalanceUnit: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  opacity: 0.6;
  font-size: 2.5rem;
  padding: 18px 0 0 0;
`;

const StockContainer: any = styled.div`
  height: 240px;
  width: 350px;
  margin: 120px 20px 0 0;
`;

const TextContainer: any = styled.div`
  display: flex;
  flex: 1;
  z-index: 2;
  flex-direction: column;
  background: ${Theme.color.secondaryLight};
  padding: 70px 20px 10rem 0;
  min-width: 385px;
`;

const InfoTextContainer: any = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 20px 0 0 0;
  padding: 0 0 1px 11px;
  border-left: 3px solid ${Theme.color.secondary};
`;

const InfoTextRowFirst: any = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  line-height: 1rem;
  margin: -4px 0 0 0;
  font-size: 1.3rem;
`;

const InfoTextRow: any = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  line-height: 1rem;
  margin: 24px 0 0 0;
  font-size: 1.3rem;
  height: 20px;
`;

const InfoTextKey: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  margin: 0 0 0 0;
`;

const InfoTextValue: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  font-weight: 700;
  margin: 0 0 0 0;
`;

const EmailContainer: any = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 30rem;
  padding: 100px 0 0 0;

  @media only screen and (max-width: 400px) {
    width: 320px;
  }
`;

const ExplanationContainer: any = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 30rem;
  padding: 100px 0 0 0;

  @media only screen and (max-width: 400px) {
    width: 320px;
  }
`;

const ExplanationHeader: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  font-size: 1.5rem;
  margin: 20px 0 0 0;
`;

const ExplanationText: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  font-size: 1rem;
  margin: 8px 0 0 0;
`;

const Title: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  font-size: 5rem;
  margin: 20px 0 0 0;
`;

const WaveContainer: any = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Wave: any = styled.img.attrs(() => ({
  src: require("../../public/img/wave.svg")
}))`
  z-index: 1;
  margin: -50px -65px 0 0;
  min-height: 110%;
  height: 110%;
  width: 150px;
`;

export default Municipality;
