import fetch from "isomorphic-unfetch";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Router, { useRouter } from "next/router";
import Link from "next/link";

import { Theme } from "../../styles";
import MunicipalityOutline from "../../components/MunicipalityOutline";
import StockChart from "../../components/StockChart";

const subPages = [
  "tavanomainen_metsänhoito",
  "pidennetty_kiertoaika",
  "jatkuvapeitteinen_metsänkasvatus",
  "tilaus"
];

const subTitles = {
  tavanomainen_metsänhoito: "Tavanomainen metsänhoito",
  pidennetty_kiertoaika: "Pidennetty kiertoaika (muutos hakkuutavassa)",
  jatkuvapeitteinen_metsänkasvatus: "Jatkuvapeitteinen metsänkasvatus",
  tilaus: "Hiilennieluraportti"
};

const navTitles = {
  tavanomainen_metsänhoito: "tavanomainen metsänhoito",
  pidennetty_kiertoaika: "pidennetty kiertoaika",
  jatkuvapeitteinen_metsänkasvatus: "jatkuvapeitteinen metsänkasvatus",
  tilaus: "hiilennieluraportti"
};

const subTexts = {
  tavanomainen_metsänhoito:
    "Laskelmassa metsät perustetaan istuttamalla. Harvennukset tehdään alaharvennuksina ja lopuksi tehdään uudistushakkuu.",
  pidennetty_kiertoaika:
    "Laskelmassa harvennukset tehdään yläharvennuksina. Uudistaminen tapahtuu kun se on taloudellisesti järkevää. Metsänomistajan tulot eivät pienene verrattuna tavanomaiseen.",
  jatkuvapeitteinen_metsänkasvatus:
    "Laskelmassa harvennukset tehdään yläharvennuksina ja metsät uudistuvat luontaisesti. Uudistaminen tapahtuu jos se on taloudellisesti järkevää. Metsänomistajan tulot eivät pienene verrattuna tavanomaiseen."
};

const forestryIndexes = {
  tavanomainen_metsänhoito: 3,
  pidennetty_kiertoaika: 4,
  jatkuvapeitteinen_metsänkasvatus: 2
};

const Municipality = props => {
  const [ready, setReady] = useState(false);
  const [isDropdownOpen, setisDropdownOpen] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formVal, setFormVal] = useState(props.data ? props.data.NAMEFIN : "");
  const [isSending, setIsSending] = useState(false);

  const dropdownRef = useRef(null);

  const forestryIndex = forestryIndexes[props.subPage];

  const co2ekv =
    props.data && forestryIndex && props.data.forecast_data[forestryIndex].CBT1
      ? roundVal(props.data.forecast_data[forestryIndex].CBT1 / 10)
      : 0;

  let co2ekvha =
    props.data &&
    forestryIndex &&
    co2ekv / (props.data.forest_area - props.data.non_forecasted_area);

  co2ekvha = co2ekvha > 0 ? co2ekvha : 1;

  // const stockAmounts = props.data && [
  //   props.data.forecast_data[4].Maa5 - props.data.forecast_data[3].Maa5,
  //   props.data.forecast_data[4].Bio5 - props.data.forecast_data[3].Bio5
  // ];

  const handleArrowClick = e => {
    const spIndex = subPages.indexOf(props.subPage);
    const spNext = subPages[spIndex + 1];

    Router.push("/kunnat/" + props.id + "/" + spNext);
  };

  const handleOutsideClick = e => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setisDropdownOpen(false);
    }
  };

  const getFormData = (): string => {
    const body = {
      name: formName,
      email: formEmail,
      val: formVal,
      type: "kunta"
    };

    return JSON.stringify(body);
  };

  const handleSubmit = e => {
    setIsSending(true);
    fetch(process.env.API_URL + "/tilaus", {
      method: "POST",
      body: getFormData()
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
      Router.push(Router.pathname, "/kunnat/" + props.id + "/", {
        shallow: true
      });
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
      <Head>
        <title>
          {props.data ? props.data.NAMEFIN : "Haku"} - Arvometsä hiililaskuri
        </title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
      </Head>
      {ready && (
        <>
          {props.data ? (
            <Container>
              <Overlay>
                <GraphContainer>
                  <Link href={"/"}>
                    <LogoContainer>
                      <Logo />
                      <LogoTextContainer>
                        <LogoTitle />
                        <LogoText>Hiililaskuri</LogoText>
                      </LogoTextContainer>
                    </LogoContainer>
                  </Link>
                  <MunOutlineContainer>
                    <MunicipalityOutline coords={props.data.coordinates} />
                  </MunOutlineContainer>
                  {!isLastPage && (
                    <HumanContainer>
                      <HumanIcon />
                      <HumanText>{"X " + Math.round(co2ekv / 10.3)}</HumanText>
                    </HumanContainer>
                  )}
                  {!isLastPage && (
                    <BalanceRow>
                      <BalanceCircleSmall>
                        <BalanceTextSmall>Kunta</BalanceTextSmall>
                        <BalanceValueSmall>
                          {Math.round(co2ekvha * 10) / 10}
                        </BalanceValueSmall>
                        <BalanceUnitSmall>
                          CO<sub>2</sub> / ha
                        </BalanceUnitSmall>
                      </BalanceCircleSmall>
                      <BalanceCircle>
                        <BalanceText>Maakunta</BalanceText>
                        <BalanceValue>-&nbsp;</BalanceValue>
                        <BalanceUnit>
                          CO<sub>2</sub> / ha
                        </BalanceUnit>
                      </BalanceCircle>
                    </BalanceRow>
                  )}
                  {/* <StockContainer>
                <StockChart
                  data1={[stockAmounts[0]]}
                  data2={[stockAmounts[1]]}
                />
              </StockContainer> */}
                </GraphContainer>
                <WaveContainer>
                  <Wave />
                </WaveContainer>
              </Overlay>
              <TextContainer>
                <AvoinLink>
                  <AvoinLogo />
                </AvoinLink>
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
                      {Math.round(
                        getRatio(
                          props.data.forest_area,
                          props.data.non_forecasted_area
                        ) * 10
                      ) /
                        10 +
                        "%"}
                    </InfoTextValue>
                  </InfoTextRow>
                </InfoTextContainer>
                <ForestryDropdown ref={dropdownRef}>
                  <ForestryDropdownSelected
                    onClick={e => {
                      setisDropdownOpen(!isDropdownOpen);
                    }}
                  >
                    <ForestryLink>{navTitles[props.subPage]}</ForestryLink>
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
                          "/kunnat/" + props.id + "/tavanomainen_metsänhoito"
                        }
                      >
                        <ForestryLink>tavanomainen metsänhoito</ForestryLink>
                      </Link>
                    )}
                    {props.subPage !== "pidennetty_kiertoaika" && (
                      <Link
                        href={"/kunnat/" + props.id + "/pidennetty_kiertoaika"}
                      >
                        <ForestryLink>pidennetty kiertoaika</ForestryLink>
                      </Link>
                    )}
                    {props.subPage !== "jatkuvapeitteinen_metsänkasvatus" && (
                      <Link
                        href={
                          "/kunnat/" +
                          props.id +
                          "/jatkuvapeitteinen_metsänkasvatus"
                        }
                      >
                        <ForestryLink>
                          jatkuvapeitteinen metsänhoito
                        </ForestryLink>
                      </Link>
                    )}
                    {!isLastPage && (
                      <Link href={"/kunnat/" + props.id + "/tilaus"}>
                        <ForestryLink>hiilennieluraportti</ForestryLink>
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
                        Vuoden 2020 hiilitase oli {co2ekv} hiilidioksiditonnia
                        (CO2 -ekv). Metsien vuotuinen hiilidioksidin
                        nettosidonta vastaa yhteensä {Math.round(co2ekv / 10.3)}{" "}
                        keskimääräisen suomalaisen ihmisen vuotuista
                        hiilijalanjälkeä, joka on n. 10,3 hiilidioksiditonnia
                        (CO2 -ekv).
                      </ExplanationText>
                    </ExplanationContainer>
                    <ExplanationContainer>
                      <ExplanationHeader>
                        Vuotuinen hiilitase (CO-ekv)
                      </ExplanationHeader>
                      <ExplanationText>
                        Hiilitase tarkoittaa metsätalouden sitoman ja
                        vapauttaman hiilen erotusta tietyn ajanjakson kuluessa.
                        Positiivinen tase tarkoittaa, että metsätalous on
                        poistanut hiiltä ilmakehästä ja toiminut hiilinieluna.
                        Hiilitaseessa otetaan huomioon myös puutuotteiden
                        korvausvaikutukset.
                      </ExplanationText>
                    </ExplanationContainer>
                    <ExplanationContainer>
                      <ExplanationHeader>
                        Verrattuna alueen metsiin:
                      </ExplanationHeader>
                      <ExplanationInfoRow>
                        <ExplanationInfoKey>
                          Kunnan alueen hiilennielu:&nbsp;&nbsp;
                        </ExplanationInfoKey>
                        <ExplanationInfoValue>
                          {Math.round(co2ekvha * 10) / 10 + " CO2 / ha"}
                        </ExplanationInfoValue>
                      </ExplanationInfoRow>
                      <ExplanationInfoRow>
                        <ExplanationInfoKey>
                          Maakunnan alueen hiilennielu:&nbsp;&nbsp;
                        </ExplanationInfoKey>
                        <ExplanationInfoValue>-</ExplanationInfoValue>
                      </ExplanationInfoRow>
                    </ExplanationContainer>
                    <Arrow onClick={handleArrowClick}>
                      <ArrowTail>
                        <ArrowText>
                          Miten parannan metsän hiilennielua?
                        </ArrowText>
                      </ArrowTail>
                      <ArrowPoint />
                    </Arrow>
                  </>
                ) : (
                  <>
                    <ExplanationContainer>
                      <ExplanationHeader>
                        {subTitles[props.subPage]}
                      </ExplanationHeader>
                      <ExplanationText>
                        Tilaamalla hiilennieluraportin määrität metsänhoitotavan
                        itse. Raportti voidaan rakentaa metsänhoitosuunnitelman
                        mukaisesti. On myös mahdollista tilata
                        metsänhoitosuunnitelma ja sen mukainen
                        hiilennieluraportti.
                      </ExplanationText>
                      <PayInfoCol>
                        <PayInfoKey>
                          Hiilennieluraportti:&nbsp;&nbsp;
                        </PayInfoKey>
                        <PayInfoValue>139 € + alv</PayInfoValue>
                        <PayInfoKey>
                          Metsäsuunnitelma + hiilennieluraportti:&nbsp;&nbsp;
                        </PayInfoKey>
                        <PayInfoValue>
                          280 € + alv (sis. 40ha, lisähehtaarit 5€)
                        </PayInfoValue>
                      </PayInfoCol>
                    </ExplanationContainer>
                    <Form>
                      <FormLabel>Sähköpostiosoite</FormLabel>
                      <FormInput
                        type="text"
                        value={formEmail}
                        onChange={e => setFormEmail(e.val)}
                      />
                      <FormLabel>Nimi</FormLabel>
                      <FormInput
                        type="text"
                        value={formName}
                        onChange={e => setFormName(e.val)}
                      />
                      <FormLabel>Kunta</FormLabel>
                      <FormInput
                        type="text"
                        value={formVal}
                        onChange={e => setFormVal(e.val)}
                      />
                      <FormButton
                        onClick={handleSubmit}
                        disabled={isSending}
                        isSending={isSending}
                      >
                        Lähetä tilaus
                      </FormButton>
                      <FormText>
                        Olemme teihin yhteydessä ja tarkistamme tilauksen ennen
                        toimitusta. Tietoja ei käytetä muihin tarkoituksiin tai
                        luovuteta kolmansille osapuolille.
                      </FormText>
                    </Form>
                  </>
                )}
              </TextContainer>
            </Container>
          ) : (
            <ErrorContainer>
              <ErrorText>Kuntaa "{props.id}" ei löydy.</ErrorText>
              <Link href="/">
                <ErrorLink>
                  <u>Takaisin hakuun.</u>
                </ErrorLink>
              </Link>
            </ErrorContainer>
          )}
        </>
      )}
    </>
  );
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

  let json = null;

  if (res.status === 200) {
    json = await res.json();
  }

  return { data: json, subPage, id, redirect };
};

const roundVal = (val: number | string) => {
  if (typeof val === "string") {
    val = Number(val);
  }
  val = Math.round(val);
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
  padding: 0 0 0 20px;
`;

const Overlay: any = styled.div`
  display: flex;
  flex: 1.4;
  flex-direction: row;
  z-index: 1;
  background: rgba(49, 66, 52, 0.95);
`;

const MunOutlineContainer: any = styled.div`
  height: 220px;
  width: 300px;
  margin: 4rem 0 0 0;
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
  margin: 60px 20px 0 0;
  align-items: center;
`;

const HumanIcon: any = styled.img.attrs(() => ({
  src: require("../../public/img/human.svg")
}))`
  height: 14rem;
`;

const HumanText: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.secondaryLight};
  font-size: 5rem;
  margin: 1rem 0 0 -3.5rem;
`;

const StockContainer: any = styled.div`
  height: 240px;
  width: 350px;
  margin: 120px 20px 0 0;
`;

const TextContainer: any = styled.div`
  display: flex;
  flex: 1;
  z-index: 3;
  flex-direction: column;
  background: ${Theme.color.secondaryLight};
  padding: 0 20px 10rem 1rem;
  min-width: 385px;
  margin: 0 0 0 -5px;
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

const ForestryDropdown: any = styled.div`
  font-family: ${Theme.font.secondary};
  font-size: 1.2rem;
  margin: 3rem 0 1rem 0;
  &:hover {
    cursor: pointer;
  }
`;

const ForestryDropdownSelected: any = styled.div`
  margin: 0;
  background: ${Theme.color.primary};
  color: ${Theme.color.secondaryLight};
  width: 15.5rem;
  display: flex;
  justify-content: space-between;
`;

const ForestryDropdownItems: any = styled("div")<{ isOpen: boolean }>`
  display: flex;
  visibility: ${props => (props.isOpen ? "visible" : "hidden")};
  flex-direction: column;
  position: absolute;
  background: ${Theme.color.primaryLight};
  width: 15.5rem;
`;

const ForestryLink: any = styled.p`
  margin: 0;
  padding: 0.5rem;
  &:hover {
    background: ${Theme.color.primary};
    color: ${Theme.color.secondaryLight};
  }
`;

const ExplanationContainer: any = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 30rem;
  padding: 0 0 2.5rem 0;

  @media only screen and (max-width: 400px) {
    width: 320px;
  }
`;

const ExplanationHeader: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  font-size: 1.5rem;
  margin: 0 0 0 0;
`;

const ExplanationText: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  font-size: 1rem;
  margin: 8px 0 0 0;
`;

const ExplanationInfoRow: any = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  line-height: 1rem;
  margin: 10px 0 0 0;
  font-size: 1rem;
  height: 20px;
`;

const ExplanationInfoKey: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  margin: 0 0 0 0;
`;

const ExplanationInfoValue: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  font-weight: 700;
  margin: 0 0 0 0;
`;

const PayInfoCol: any = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1rem;
  margin: 10px 0 0 0;
  font-size: 1rem;
  height: 20px;
`;

const PayInfoKey: any = styled.p`
  font-family: ${Theme.font.primary};
  color: ${Theme.color.primary};
  font-size: 1.15rem;
  margin: 30px 0 0 0;
`;

const PayInfoValue: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  font-size: 1.6rem;
  margin: 7px 0 0 0;
`;

const Form: any = styled.div`
  display: flex;
  flex-direction: column;
  margin: 13rem 0 0 0;
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
  background: ${Theme.color.secondary};
  border: 1.5px inset;
`;

const FormButton: any = styled("div")<{ isSending: boolean }>`
  font-family: ${Theme.font.secondary};
  background: ${props =>
    props.isSending ? Theme.color.primaryLight : Theme.color.primary};
  color: ${Theme.color.secondaryLight};
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
  margin: 8px 0 0 0;
`;

const Title: any = styled.p`
  font-family: ${Theme.font.secondary};
  color: ${Theme.color.primary};
  font-size: 5rem;
  margin: 20px 0 0 0;
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
  padding: 5px 0 5px 10px;
  &:hover {
    cursor: pointer;
  }
`;

const ArrowText: any = styled.div`
  color: ${Theme.color.secondaryLight};
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

const WaveContainer: any = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2;
`;

const Wave: any = styled.img.attrs(() => ({
  src: require("../../public/img/wave.svg")
}))`
  margin: -50px -70px 0 0;
  min-height: 110%;
  height: 110%;
  width: 150px;
`;

const LogoContainer: any = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 1.8rem auto 0 1rem;
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
  src: require("../../public/img/kapy.svg")
}))`
  height: 3rem;
  margin: 0 0.6rem -5px 0;
`;

const LogoTitle: any = styled.img.attrs(() => ({
  src: require("../../public/img/arvometsa.svg")
}))`
  width: 9rem;
`;

const LogoText: any = styled.p`
  color: ${Theme.color.secondary};
  font-family: ${Theme.font.primary};
  letter-spacing: 0.03rem;
  line-height: 1rem;
  font-size: 1.85rem;
  margin: 7px 0 0 -4px;
  font-weight: 700;
`;

const AvoinLink: any = styled.a.attrs(() => ({
  href: "https://www.avoin.org"
}))`
  margin: 0 0 0 auto;
`;

const AvoinLogo: any = styled.img.attrs(() => ({
  src: require("../../public/img/avoin-black.svg")
}))`
  width: 13rem;
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

export default Municipality;
