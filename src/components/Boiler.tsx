import fetch from "isomorphic-unfetch";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import Router from "next/router";
import Link from "next/link";

import { Theme } from "../styles";
import MunicipalityOutline from "./MunicipalityOutline";
import StockChart from "./StockChart";
import {
  forestryIndexes,
  subTitles,
  navTitles,
  subTexts,
  radioVals,
  roundVal,
  getRatio,
  addThousandSpaces
} from "../utils";

interface Props {
  data: any;
  comparisonData: any;
  id: string;
  subPage: string;
  type: string;
  redirect: boolean;
}

const Boiler = (props: Props) => {
  const [ready, setReady] = useState(false);
  const [isDropdownOpen, setisDropdownOpen] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);

  const [co2ekv, setCo2ekv] = useState(0);
  const [co2ekvHa, setCo2ekvHa] = useState(0);
  const [comparisonCo2ekvHa, setComparisonCo2ekvHa] = useState(0);
  const [stockVals, setStockVals] = useState({});
  const [checked, setChecked] = useState({
    radio1: true,
    radio2: false,
    radio3: false
  });

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formVal, setFormVal] = useState(props.data.title);
  const [isSending, setIsSending] = useState(false);

  const root = props.type == "estate" ? "/kiinteistot/" : "/kunnat/";
  const typeName = props.type == "estate" ? "kiinteistö" : "kunta";
  const stockName = props.type == "estate" ? "Kiinteistön" : "Kunnan";
  const comparisonStockName = props.type == "estate" ? "Kunnan" : "Maakunnan";
  const stockColNames = props.type == "estate" ? ["Kiinteistö"] : ["Kunta"];
  props.comparisonData &&
    (props.type === "estate"
      ? stockColNames.push("Kunta")
      : stockColNames.push("Maakunta"));

  const formNameTitle = props.type == "estate" ? "Kiinteistötunnus" : "Kunta";

  const dropdownRef = useRef(null);

  const forestryIndex = forestryIndexes[props.subPage];

  const handleArrowClick = e => {
    Router.push(root + props.id + "/tilaus");
  };

  const handleOutsideClick = e => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setisDropdownOpen(false);
    }
  };

  const handleRadioClick = e => {
    const radioChecks = {
      radio1: false,
      radio2: false,
      radio3: false
    };

    radioChecks[e.target.value] = true;
    setChecked(radioChecks);
  };

  const getFormData = (): string => {
    let radioVal = "radio1";
    for (let key in checked) {
      if (checked[key]) {
        radioVal = key;
        break;
      }
    }

    const body = {
      name: formName,
      email: formEmail,
      areaId: formVal,
      areaType: typeName,
      orderType: radioVals[radioVal]
    };

    return JSON.stringify(body);
  };

  const handleSubmit = e => {
    setIsSending(true);
    fetch(process.env.API_URL + "/tilaus", {
      method: "POST",
      body: getFormData(),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        setIsSending(false);
        if (res.status === 200) {
          Router.push("/tilaus");
        } else {
          Router.push("/tilaus_error");
        }
      })
      .catch(error => {
        setIsSending(false);
        Router.push("/tilaus_error");
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    if (props.redirect) {
      Router.push(Router.pathname, root + props.id + "/", {
        shallow: true
      });
    }

    if (props.data.forecastVals[forestryIndex]) {
      const itemCo2ekv = props.data.forecastVals[forestryIndex].CBT1 / 10;

      const itemCo2ekvHa = itemCo2ekv / props.data.forecastHa;

      let compCo2ekvHa = null;

      if (props.comparisonData) {
        compCo2ekvHa =
          props.comparisonData.forecastVals[3].CBT1 /
          props.comparisonData.forecastHa /
          10;
      }

      const stocks = {
        item: itemCo2ekvHa,
        comparison: compCo2ekvHa
      };

      setCo2ekv(itemCo2ekv);
      setCo2ekvHa(itemCo2ekvHa);
      setComparisonCo2ekvHa(compCo2ekvHa);
      setStockVals(stocks);
    }

    document.addEventListener("mousedown", handleOutsideClick);

    setReady(true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (props.subPage === "tilaus") {
      setIsLastPage(true);
    }
  });

  return (
    <>
      {ready && (
        <>
          <Container>
            <Overlay>
              <GraphContainer>
                <Link href={"/"}>
                  <LogoContainer>
                    <Logo />
                    <LogoTextContainer>
                      <LogoText>Hiililaskuri</LogoText>
                      <LogoTitle />
                    </LogoTextContainer>
                  </LogoContainer>
                </Link>
                <MunOutlineContainer>
                  <MunicipalityOutline coords={props.data.coordinates} />
                </MunOutlineContainer>
                {!isLastPage ? (
                  <>
                    <HumanContainer>
                      <HumanIcon />
                      <HumanText>
                        {"X " + addThousandSpaces(roundVal(co2ekv / 10.3, 0))}
                      </HumanText>
                    </HumanContainer>
                    {/* <BalanceRow>
                      <BalanceCircleSmall>
                        <BalanceTextSmall>Tila</BalanceTextSmall>
                        <BalanceValueSmall>
                          {Math.round(co2ekvHa * 10) / 10}
                        </BalanceValueSmall>
                        <BalanceUnitSmall>
                          CO<sub>2</sub> / ha
                        </BalanceUnitSmall>
                      </BalanceCircleSmall>
                      <BalanceCircle>
                        <BalanceText>Kunta</BalanceText>
                        <BalanceValue>-&nbsp;</BalanceValue>
                        <BalanceUnit>
                          CO<sub>2</sub> / ha
                        </BalanceUnit>
                      </BalanceCircle>
                    </BalanceRow> */}
                    <StockContainer>
                      <StockChart data={stockVals} colNames={stockColNames} />
                    </StockContainer>
                  </>
                ) : (
                  <>
                    <ExampleContainer>
                      <Example />
                    </ExampleContainer>
                    {/* <StockContainer>
                      <StockChart
                        data={{
                          item: {
                            Maa: 139.52681923424467,
                            Bio: 67.07519673777917
                          }
                        }}
                        colNames={stockColNames}
                      />
                    </StockContainer> */}
                  </>
                )}
              </GraphContainer>
              <TextContainer>
                <TopContainer>
                  <WaveContainerTop>
                    <WaveTop />
                  </WaveContainerTop>
                  <BackgroundContainer>
                    <AvoinLink>
                      <AvoinLogo />
                    </AvoinLink>
                    <Title>{props.data.title}</Title>
                    <InfoTextContainer>
                      <InfoTextRowFirst>
                        <InfoTextKey>Pinta-ala:&nbsp;&nbsp;</InfoTextKey>
                        <InfoTextValue>
                          {addThousandSpaces(
                            roundVal(
                              props.data.areaHa,
                              props.type === "estate" ? 2 : 0
                            )
                          ) + "ha"}
                        </InfoTextValue>
                      </InfoTextRowFirst>
                      <InfoTextRow>
                        <InfoTextKey>Metsää:&nbsp;&nbsp;</InfoTextKey>
                        <InfoTextValue>
                          {addThousandSpaces(
                            roundVal(
                              props.data.forestHa,
                              props.type === "estate" ? 2 : 0
                            )
                          ) + "ha"}
                        </InfoTextValue>
                      </InfoTextRow>
                      <InfoTextRow>
                        <InfoTextKey>
                          Hiililaskelmien kattavuus:&nbsp;&nbsp;
                        </InfoTextKey>
                        <InfoTextValue>
                          {roundVal(
                            getRatio(
                              props.data.forecastHa,
                              props.data.forestHa
                            ),
                            1
                          ) + "%"}
                        </InfoTextValue>
                      </InfoTextRow>
                    </InfoTextContainer>
                  </BackgroundContainer>
                </TopContainer>
                <BottomContainer>
                  <WaveContainerBottom>
                    <WaveBottom />
                  </WaveContainerBottom>
                  <BackgroundContainer>
                    <ContentContainer>
                      <ForestryDropdownTitle>
                        Valitse metsänhoitotapa valikosta:
                      </ForestryDropdownTitle>
                      <ForestryDropdown ref={dropdownRef}>
                        <ForestryDropdownSelected
                          onClick={e => {
                            setisDropdownOpen(!isDropdownOpen);
                          }}
                        >
                          <ForestryLink>
                            {navTitles[props.subPage]}
                          </ForestryLink>
                          {isDropdownOpen ? (
                            <ForestryLink>&#x2c4;</ForestryLink>
                          ) : (
                            <ForestryLink> &#x2c5;</ForestryLink>
                          )}
                        </ForestryDropdownSelected>
                        <ForestryDropdownItems isOpen={isDropdownOpen}>
                          {props.subPage !== "tavanomainen_metsänhoito" && (
                            <Link
                              href={
                                root + props.id + "/tavanomainen_metsänhoito"
                              }
                            >
                              <ForestryLink>
                                Tavanomainen metsänhoito
                              </ForestryLink>
                            </Link>
                          )}
                          {props.subPage !== "pidennetty_kiertoaika" && (
                            <Link
                              href={root + props.id + "/pidennetty_kiertoaika"}
                            >
                              <ForestryLink>Pidennetty kiertoaika</ForestryLink>
                            </Link>
                          )}
                          {!isLastPage && (
                            <Link href={root + props.id + "/tilaus"}>
                              <ForestryLink>Hiililaskelma</ForestryLink>
                            </Link>
                          )}
                        </ForestryDropdownItems>
                      </ForestryDropdown>
                      {!isLastPage ? (
                        <>
                          <ExplanationContainer>
                            <ExplanationHeader>
                              {subTitles[props.subPage]}
                            </ExplanationHeader>
                            <ExplanationText>
                              {subTexts[props.subPage]}
                            </ExplanationText>
                            <ExplanationText>
                              Valitun alueen vuoden 2020 hiilitase on{" "}
                              {addThousandSpaces(roundVal(co2ekv, 0))}{" "}
                              hiilidioksiditonnia (CO2 -ekv). Metsien vuotuinen
                              hiilidioksidin nettosidonta vastaa yhteensä{" "}
                              {addThousandSpaces(roundVal(co2ekv / 10.3, 0))}{" "}
                              keskimääräisen suomalaisen ihmisen vuotuista
                              hiilijalanjälkeä, joka on n. 10,3
                              hiilidioksiditonnia (CO2 -ekv).
                            </ExplanationText>
                          </ExplanationContainer>
                          <ExplanationContainer>
                            <ExplanationHeader>
                              Vuotuinen hiilitase (CO-ekv)
                            </ExplanationHeader>
                            <ExplanationText>
                              Hiilitase tarkoittaa metsätalouden sitoman ja
                              vapauttaman hiilen erotusta tietyn ajanjakson
                              kuluessa. Positiivinen tase tarkoittaa, että
                              metsätalous on poistanut hiiltä ilmakehästä ja
                              toiminut hiilinieluna. Hiilitaseessa otetaan
                              huomioon myös puutuotteiden korvausvaikutukset.
                            </ExplanationText>
                          </ExplanationContainer>
                          <ExplanationContainer>
                            <ExplanationHeader>
                              Verrattuna alueen metsiin:
                            </ExplanationHeader>
                            <ExplanationInfoRow>
                              <ExplanationInfoKey>
                                {stockName} alueen hiilensidonta:&nbsp;&nbsp;
                              </ExplanationInfoKey>
                              <ExplanationInfoValue>
                                {addThousandSpaces(roundVal(co2ekvHa, 1)) +
                                  " tonnia CO2-ekv/ha/vuosi"}
                              </ExplanationInfoValue>
                            </ExplanationInfoRow>
                            <ExplanationInfoRow>
                              <ExplanationInfoKey>
                                {comparisonStockName} alueen
                                hiilensidonta:&nbsp;&nbsp;
                              </ExplanationInfoKey>
                              <ExplanationInfoValue>
                                {props.comparisonData
                                  ? addThousandSpaces(
                                      roundVal(comparisonCo2ekvHa, 1)
                                    ) + " tonnia CO2-ekv/ha/vuosi"
                                  : "tulossa pian"}
                              </ExplanationInfoValue>
                            </ExplanationInfoRow>
                          </ExplanationContainer>
                          <Arrow onClick={handleArrowClick}>
                            <ArrowTail>
                              <ArrowText>Tilaa hiililaskelma</ArrowText>
                            </ArrowTail>
                          </Arrow>
                        </>
                      ) : (
                        <>
                          <ExplanationContainer>
                            <ExplanationHeader>
                              {subTitles[props.subPage]}
                            </ExplanationHeader>
                            <ExplanationText>
                              Metsänhoitotavalla ja kiertoaikaa pidentämällä
                              voit vaikuttaa metsäsi hiilensidontaan. Tilaamalla
                              hiililaskelman määrität metsänhoitotavan itse.
                              Raportti voidaan rakentaa metsänhoitosuunnitelman
                              mukaisesti. On myös mahdollista tilata
                              metsänhoitosuunnitelma ja sen mukainen
                              hiililaskelma. Hiililaskelma voidaan tehdä myös
                              useammalle kiinteistölle samanaikaisesti.
                            </ExplanationText>
                            <PayInfoCol>
                              <PayInfoRow>
                                <PayInfoRadio
                                  type="radio"
                                  value="radio1"
                                  checked={checked.radio1}
                                  onChange={handleRadioClick}
                                />
                                <PayInfoValsCol>
                                  <PayInfoKey>
                                    <u>Hiililaskelma:</u>&nbsp;&nbsp;
                                  </PayInfoKey>
                                  <PayInfoValue>139 € + alv</PayInfoValue>
                                  <PayInfoText>
                                    Hiililaskelman tilaamalla saat tarkan
                                    laskelman tavanomaisen metsänhoidon tai
                                    pidennetyn kiertoajan vaikutuksista
                                    hiilensidontaan.
                                  </PayInfoText>
                                </PayInfoValsCol>
                              </PayInfoRow>

                              <PayInfoRow>
                                <PayInfoRadio
                                  type="radio"
                                  value="radio2"
                                  checked={checked.radio2}
                                  onChange={handleRadioClick}
                                />
                                <PayInfoValsCol>
                                  <PayInfoKey>
                                    <u>
                                      Metsänhoitosuunnitelma + hiililaskelma:
                                    </u>
                                    &nbsp;&nbsp;
                                  </PayInfoKey>
                                  <PayInfoValue>
                                    280 € + alv (sis. 40ha, lisähehtaarit 5€ /
                                    ha)
                                  </PayInfoValue>
                                  <PayInfoText>
                                    Metsäsuunnitelman tilaamalla määrität
                                    metsänhoitotavan tavoitteidesi mukaisesti
                                    yhdessä Arvometsän metsäasiantuntijan
                                    kanssa. Hiililaskelma rakentuu valittujen
                                    toimenpiteiden mukaisesti.
                                  </PayInfoText>
                                </PayInfoValsCol>
                              </PayInfoRow>

                              <PayInfoRow>
                                <PayInfoRadio
                                  type="radio"
                                  value="radio3"
                                  checked={checked.radio3}
                                  onChange={handleRadioClick}
                                />
                                {props.type === "estate" ? (
                                  <PayInfoValsCol>
                                    <PayInfoKey>
                                      <u>Useamman kiinteistön hiililaskelma:</u>
                                      &nbsp;&nbsp;
                                    </PayInfoKey>
                                    <PayInfoValue>tarjouksella</PayInfoValue>
                                    <PayInfoText></PayInfoText>
                                  </PayInfoValsCol>
                                ) : (
                                  <PayInfoValsCol>
                                    <PayInfoKey>
                                      <u>
                                        Jätä yhteydenottopyyntö liittyen metsien
                                        hiililaskelmiin
                                      </u>
                                    </PayInfoKey>
                                  </PayInfoValsCol>
                                )}
                              </PayInfoRow>
                            </PayInfoCol>
                          </ExplanationContainer>
                          <Form>
                            <FormLabel>Sähköpostiosoite</FormLabel>
                            <FormInput
                              type="text"
                              value={formEmail}
                              onChange={e => setFormEmail(e.target.value)}
                            />
                            <FormLabel>Nimi</FormLabel>
                            <FormInput
                              type="text"
                              value={formName}
                              onChange={e => setFormName(e.target.value)}
                            />
                            <FormLabel>{formNameTitle}</FormLabel>
                            <FormInput
                              type="text"
                              value={formVal}
                              onChange={e => setFormVal(e.target.value)}
                            />
                            <FormButton
                              onClick={handleSubmit}
                              disabled={isSending}
                              isSending={isSending}
                            >
                              Lähetä tilaus
                            </FormButton>
                            <FormText>
                              Olemme teihin yhteydessä ja tarkistamme tilauksen
                              ennen toimitusta. Tietoja ei käytetä muihin
                              tarkoituksiin tai luovuteta kolmansille
                              osapuolille.
                            </FormText>
                          </Form>
                        </>
                      )}
                    </ContentContainer>
                  </BackgroundContainer>
                </BottomContainer>
              </TextContainer>
            </Overlay>
          </Container>
        </>
      )}
      <Test></Test>
    </>
  );
};

const Test: any = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

const Container: any = styled.div`
  background-image: url(${require("../public/img/forest.jpg")});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex: 1;
  min-height: 100%;
`;

const GraphContainer: any = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: flex-end;
  padding: 0 0 0 20px;
`;

const Overlay: any = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  z-index: 1;
  background: rgba(49, 66, 52, 0.95);
`;

const MunOutlineContainer: any = styled.div`
  height: 220px;
  width: 300px;
  margin: 3rem 0 0 0;
  display: flex;
  justify-content: flex-end;
`;

const BalanceRow: any = styled.div`
  height: 240px;
  margin: 70px 20px 0 0;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const BalanceCircle: any = styled.div`
  display: flex;
  height: 200px;
  width: 200px;
  background: ${Theme.color.secondary};
  border-radius: 300px;
  align-items: center;
  justify-content: center;
`;

const BalanceText: any = styled.p`
  position: absolute;
  left: auto;
  right: auto;
  margin: -70px 0 0 0;
`;

const BalanceValue: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  font-size: 3.1rem;
`;

const BalanceUnit: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  opacity: 0.6;
  font-size: 2.2rem;
  padding: 18px 0 0 0;
`;

const BalanceCircleSmall: any = styled.div`
  display: flex;
  height: 150px;
  width: 150px;
  background: ${Theme.color.secondary};
  border-radius: 300px;
  align-items: center;
  justify-content: center;
  margin: 0 30px 0 0;
`;

const BalanceTextSmall: any = styled.p`
  position: absolute;
  left: auto;
  right: auto;
  margin: -50px 0 0 0;
`;

const BalanceValueSmall: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  font-size: 2.5rem;
`;

const BalanceUnitSmall: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  opacity: 0.6;
  font-size: 1.5rem;
  padding: 12px 0 0 0;
`;

const HumanContainer: any = styled.div`
  height: 240px;
  display: flex;
  flex-direction: row;
  margin: 145px 20px 0 0;
  align-items: center;
`;

const HumanIcon: any = styled.img.attrs(() => ({
  src: require("../public/img/human.svg")
}))`
  height: 14rem;
`;

const HumanText: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.white};
  font-size: 5rem;
  margin: 1rem 0 0 -3.5rem;
`;

const StockContainer: any = styled.div`
  height: 240px;
  width: 350px;
  margin: 120px 20px 0 0;
`;

const ExampleContainer: any = styled.div`
  margin: 60px -20px 0 0;
  display: flex;
  flex: 1;
  @media only screen and (max-width: 1330px) {
    margin: 140px -20px 0 0;
  }
`;

const Example: any = styled.img.attrs(() => ({
  src: require("../public/img/example.png")
}))`
  height: 900px;
  @media only screen and (max-width: 1330px) {
    height: 545px;
  }
`;

const TextContainer: any = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 385px;
  align-items: flex-start;
`;

const TopContainer: any = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: 0 0 4px 0;
`;

const BottomContainer: any = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  flex: 1;
`;

const BackgroundContainer: any = styled.div`
  display: flex;
  flex: 1;
  z-index: 3;
  background: ${Theme.color.white};
  flex-direction: column;
  padding: 0 15px 35px 0;
`;

const ContentContainer: any = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 35rem;
  padding: 0 14px 50px 0;
  @media only screen and (max-width: 400px) {
    width: 320px;
  }
`;

const InfoTextContainer: any = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 20px 0 0 0;
  padding: 4px 0 1px 11px;
  border-left: 3px solid ${Theme.color.primaryLight};
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
  font-weight: 500;
  margin: 0 0 0 0;
`;

const ForestryDropdown: any = styled.div`
  font-family: ${Theme.font.secondary};
  font-size: 1.6rem;
  margin: 0 0 2.5rem 0;
  width: 100%;
  height: 45px;
  &:hover {
    cursor: pointer;
  }
`;

const ForestryDropdownSelected: any = styled.div`
  margin: 0;
  background: ${Theme.color.primary};
  color: ${Theme.color.white};
  display: flex;
  justify-content: space-between;
`;

const ForestryDropdownItems: any = styled("div")<{ isOpen: boolean }>`
  display: flex;
  visibility: ${props => (props.isOpen ? "visible" : "hidden")};
  flex-direction: column;
  position: relative;
  background: ${Theme.color.primaryLight};
`;

const ForestryDropdownTitle: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  font-size: 1.1rem;
  margin: 15px 0 0 0;
  padding: 2rem 0 0.7rem 0;
`;

const ForestryLink: any = styled.p`
  margin: 0;
  padding: 0.5rem 0.7rem 0.5rem 0.7rem;
  &:hover {
    background: ${Theme.color.primary};
    color: ${Theme.color.white};
  }
`;

const ExplanationContainer: any = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0 2.5rem 0;
`;

const ExplanationHeader: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  font-size: 1.6rem;
  margin: 0 0 0 0;
`;

const ExplanationText: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  font-size: 1.1rem;
  margin: 8px 0 0 0;
`;

const ExplanationInfoRow: any = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  margin: 10px 0 0 0;
  font-size: 1rem;
  flex-wrap: wrap;
`;

const ExplanationInfoKey: any = styled.p`
  font-family: ${Theme.font.primary};
  font-size: 1.1rem;
  color: ${Theme.color.primary};
  margin: 0 0 0 0;
`;

const ExplanationInfoValue: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0 0;
`;

const PayInfoCol: any = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1rem;
  margin: 10px 0 0 0;
  font-size: 1rem;
`;

const PayInfoRow: any = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin: 30px 0 0 0;
`;

const PayInfoRadio: any = styled.input`
  margin: 2px 10px 0 0;
`;

const PayInfoValsCol: any = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const PayInfoKey: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  font-size: 1.15rem;
  margin: 0;
`;

const PayInfoValue: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  font-size: 1.6rem;
  margin: 7px 0 0 0;
`;

const PayInfoText: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  font-size: 1.1rem;
  margin: 8px 0 0 0;
`;

const Form: any = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1rem 0 0 0;
  width: 20rem;
`;

const FormLabel: any = styled.p`
  margin: 0;
  font-size: 1.4rem;
`;

const FormInput: any = styled.input`
  color: ${Theme.color.primary};
  font-family: ${Theme.font.primary};
  margin: 0 0 14px 0;
  padding: 5px;
  font-size: 1.2rem;
  background: ${Theme.color.secondaryLight};
  border: 1.5px inset;
`;

const FormButton: any = styled("div")<{ isSending: boolean }>`
  font-family: ${Theme.font.secondary};
  background: ${props =>
    props.isSending ? Theme.color.primaryLight : Theme.color.primary};
  color: ${Theme.color.white};
  padding: 10px;
  margin: 10px 0 0 0;
  font-size: 1.5rem;
  text-align: center;
  &:hover {
    cursor: ${props => (props.isSending ? "defualt" : "pointer")};
  }
`;

const FormText: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  font-size: 1rem;
  margin: 8px 0 20rem 0;
`;

const Title: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  font-size: 4rem;
  margin: 120px 0 0 0;
  font-weight: 500;
`;

const Arrow: any = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0;
`;

const ArrowTail: any = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${Theme.color.primary};
  height: 70px;
  width: 100%;
  &:hover {
    cursor: pointer;
  }
`;

const ArrowText: any = styled.div`
  color: ${Theme.color.white};
  z-index: 2;
  text-align: center;
  font-size: 1.6rem;
`;

const ArrowPoint: any = styled.div`
  width: 0;
  height: 0;
  border-top: 60px solid transparent;
  border-bottom: 60px solid transparent;
  border-left: 60px solid ${Theme.color.primary};
  margin: 0 0 0 -20px;
  &:hover {
    cursor: pointer;
  }
`;

const WaveContainerTop: any = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  z-index: 2;
  position: relative;
  width: 130px;
  margin: 0 -45px 0 0;
`;

const WaveTop: any = styled.img.attrs(() => ({
  src: require("../public/img/wave-top.svg")
}))`
  position: absolute;
  width: 130px;
  height: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const WaveContainerBottom: any = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2;
  position: relative;
  width: 130px;
  margin: 0 -45px 0 0;
`;

const WaveBottom: any = styled.img.attrs(() => ({
  src: require("../public/img/wave-bottom.svg")
}))`
  position: absolute;
  width: 130px;
  height: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const LogoContainer: any = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 1.3rem auto 0 0.3rem;
  &:hover {
    cursor: pointer;
  }
`;

const LogoTextContainer: any = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
`;

const Logo: any = styled.img.attrs(() => ({
  src: require("../public/img/kapy.svg")
}))`
  height: 3rem;
  margin: 0 0.6rem -5px 0;
`;

const LogoTitle: any = styled.img.attrs(() => ({
  src: require("../public/img/arvometsa.svg")
}))`
  width: 6rem;
  margin: 6px 0 -4px -1px;
`;

const LogoText: any = styled.p`
  color: ${Theme.color.white};
  font-family: ${Theme.font.primary};
  letter-spacing: 0.03rem;
  line-height: 1rem;
  font-size: 2rem;
  margin: 7px 0 0 -4px;
  font-weight: 500;
`;

const AvoinLink: any = styled.a.attrs(() => ({
  href: "https://www.avoin.org"
}))`
  margin: 0 0 0 auto;
`;

const AvoinLogo: any = styled.img.attrs(() => ({
  src: require("../public/img/avoin-black.svg")
}))`
  width: 13rem;
  position: absolute;
  top: 0;
  right: 0;
  overflow: hidden;
`;

const ErrorContainer: any = styled.div`
  color: ${Theme.color.secondary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 5px;
`;

const ErrorText: any = styled.p`
  color: ${Theme.color.primary};
  font-family: ${Theme.font.primary};
  font-size: 1.5rem;
`;

const ErrorLink: any = styled.p`
  color: ${Theme.color.primary};
  font-family: ${Theme.font.primary};
  font-size: 1.2rem;
  margin: 40px 0 0 0;
  &:hover {
    cursor: pointer;
  }
`;

export default Boiler;
