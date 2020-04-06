import styled from "styled-components";
import { useState } from "react";
import AutoSuggest from "react-autosuggest";
import { useRouter } from "next/router";
import Head from "next/head";

import { Theme } from "../styles";
import muns from "../public/kunnat_index.json";

const Home = () => {
  const router = useRouter();
  const [munValue, setMunValue] = useState("");
  const [munSuggestions, setMunSuggestions] = useState([]);

  const [estateValue, setEstateValue] = useState("");
  const [estateSuggestions, setEstateSuggestions] = useState([]);

  const [blockEnter, setBlockEnter] = useState(false);

  const getMunSuggestions = value => {
    const val = value.trim().toLowerCase();
    const filteredMuns = muns.filter(mun =>
      mun.name.toLowerCase().includes(val)
    );

    filteredMuns.sort((a, b) => {
      const an = a.name.toLowerCase();
      const bn = b.name.toLowerCase();

      for (let i = 0; i < Math.min(an.length, bn.length, val.length); i++) {
        if (!(an[i] === bn[i] && an[i] === val[i])) {
          if (an[i] === val[i]) {
            return -1;
          }

          if (bn[i] === val[i]) {
            return 1;
          }
        }
      }

      if ([an, bn].sort()[0] === an) {
        return -1;
      } else {
        return 1;
      }
    });

    return filteredMuns;
  };

  const getEstateSuggestions = _value => {
    return [];
  };

  const isValidMun = name => {
    const val = muns.find(el => {
      if (name.trim().toLowerCase() === el.name.trim().toLowerCase()) {
        return true;
      }
      return false;
    });

    if (val !== null) {
      return true;
    }

    return false;
  };

  const goToMun = () => {
    if (isValidMun(munValue)) {
      router.push("/kunnat/" + munValue.trim().toLowerCase());
    }
  };

  const handleMunClick = e => {
    goToMun();
  };

  const handleMunKeyPress = e => {
    if (e.key.toLowerCase() === "enter" && !blockEnter) {
      goToMun();
    }
  };

  const goToEstate = () => {
    router.push("/kiinteistot/" + estateValue.trim().toLowerCase());
  };

  const handleEstateClick = e => {
    goToEstate();
  };

  const handleEstateKeyPress = e => {
    if (e.key.toLowerCase() === "enter" && !blockEnter) {
      goToEstate();
    }
  };

  return (
    <>
      <Head>
        <title>Arvometsä hiililaskuri</title>
        <meta
          name="viewport"
          content="height=device-height; width=device-width"
        />
      </Head>
      <Container>
        <Overlay>
          <AvoinLink>
            <AvoinLogo />
          </AvoinLink>
          <LogoContainer>
            <Logo />
            <LogoTextContainer>
              <LogoText>Hiililaskuri</LogoText>
              <LogoTitle />
            </LogoTextContainer>
          </LogoContainer>
          {/* <WaveContainer>
            <Wave></Wave>
          </WaveContainer> */}
          <LowerContainer>
            <InfoTextContainer>
              <InfoTextBorder />
              <InfoTextRow>
                <InfoText>
                  Hiililaskurilla selvität metsän hiilennielun. Voit tarkastella
                  kunnan alueen metsiä tai rajata haun metsäkiinteistöön.&nbsp;
                </InfoText>
                <InfoText>
                  Voit myös vertailla eri metsänhoitotapoja ja tarkastella
                  niiden vaikutuksia hiilennieluun.
                </InfoText>
              </InfoTextRow>
            </InfoTextContainer>
            <SearchContainer onKeyPress={handleEstateKeyPress}>
              <AutoSuggest
                suggestions={estateSuggestions}
                onSuggestionsClearRequested={() => setEstateSuggestions([])}
                onSuggestionsFetchRequested={({ value }) => {
                  setEstateValue(value);
                  setEstateSuggestions(getEstateSuggestions(value));
                }}
                // onSuggestionSelected={(_, { suggestionValue }) =>
                //   console.log("Selected: " + suggestionValue)
                // }
                getSuggestionValue={suggestion => suggestion.name}
                renderSuggestion={suggestion => <span>{suggestion.name}</span>}
                inputProps={{
                  placeholder: "Etsi kiinteistötunnusta (esim. 123-456-78-90)",
                  value: estateValue,
                  onChange: (_, { newValue }) => {
                    setEstateValue(newValue);
                  }
                }}
                onSuggestionHighlighted={e => {
                  e.suggestion ? setBlockEnter(true) : setBlockEnter(false);
                }}
                highlightFirstSuggestion={true}
              />
              <SearchIconContainer onClick={handleEstateClick}>
                <SearchIcon />
              </SearchIconContainer>
            </SearchContainer>
            <SearchContainer onKeyPress={handleMunKeyPress}>
              <AutoSuggest
                suggestions={munSuggestions}
                onSuggestionsClearRequested={() => setMunSuggestions([])}
                onSuggestionsFetchRequested={({ value }) => {
                  setMunValue(value);
                  setMunSuggestions(getMunSuggestions(value));
                }}
                // onSuggestionSelected={(_, { suggestionValue }) =>
                //   console.log("Selected: " + suggestionValue)
                // }
                getSuggestionValue={suggestion => suggestion.name}
                renderSuggestion={suggestion => <span>{suggestion.name}</span>}
                inputProps={{
                  placeholder: "Etsi kuntaa (esim. Porvoo)",
                  value: munValue,
                  onChange: (_, { newValue }) => {
                    setMunValue(newValue);
                  }
                }}
                onSuggestionHighlighted={e => {
                  e.suggestion ? setBlockEnter(true) : setBlockEnter(false);
                }}
                highlightFirstSuggestion={true}
              />
              <SearchIconContainer onClick={handleMunClick}>
                <SearchIcon />
              </SearchIconContainer>
            </SearchContainer>
          </LowerContainer>
        </Overlay>
      </Container>
    </>
  );
};

const Container: any = styled.div`
  background-image: url(${require("../public/img/forest.jpg")});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  min-height: 100%;
`;

const Overlay: any = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  background: rgba(49, 66, 52, 0.9);
  padding: 10px;
`;

const SearchContainer: any = styled.div`
  display: flex;
  justify-content: center;
  margin: 3rem 0 0 0;
  width: 28.2rem;
  font-family: ${Theme.font.primary};
  max-width: 100%;

  @media only screen and (max-height: 620px) {
    margin: 3.5rem 0 0 0;
  }

  @media only screen and (max-width: 436px) {
    width: 100%;
  }
`;

const SearchIconContainer: any = styled.div`
  background-color: ${Theme.color.secondary};
  display: flex;
  justify-content: center;
  align-items: center;
  width: 45px;
  border-radius: 0 4px 4px 0;
  &:hover {
    cursor: pointer;
  }
`;

const SearchIcon: any = styled.img.attrs(() => ({
  src: require("../public/img/search-outline.svg")
}))`
  width: 24px;
  margin: auto;
`;

const LogoContainer: any = styled.div`
  display: flex;
  margin: 8rem auto 8rem auto;
  justify-content: flex-start;
  @media only screen and (max-height: 850px) {
    margin: 4rem auto 3rem auto;
  }
  @media only screen and (max-height: 590px) {
    margin: 2rem auto 3rem auto;
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
  height: 8rem;
  margin: 0 1rem 0 0;

  @media only screen and (max-width: 436px) {
    height: 5rem;
  }
`;

const LogoTitle: any = styled.img.attrs(() => ({
  src: require("../public/img/arvometsa.svg")
}))`
  width: 13rem;
  margin: 0 0 0.15rem 0;

  @media only screen and (max-width: 436px) {
    margin: 0 0 0.15rem -2px;
    width: 8.5rem;
  }
`;

const LogoText: any = styled.p`
  color: ${Theme.color.white};
  font-family: ${Theme.font.primary};
  line-height: 3rem;
  font-size: 4.68rem;
  margin: 14px 0 7px -4px;
  font-weight: 500;

  @media only screen and (max-width: 436px) {
    line-height: 2rem;
    font-size: 2.8rem;
  }
`;

const AvoinLink: any = styled.a.attrs(() => ({
  href: "https://www.avoin.org"
}))`
  margin: 0 0 0 auto;
`;

const AvoinLogo: any = styled.img.attrs(() => ({
  src: require("../public/img/avoin.svg")
}))`
  width: 16rem;

  @media only screen and (max-width: 436px) {
    width: 10rem;
  }
`;

const InfoTextContainer: any = styled.div`
  width: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
  max-width: 60rem;
  flex-direction: row;
`;

const InfoTextRow: any = styled.div`
  width: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const InfoTextBorder: any = styled.div`
  @media only screen and (max-width: 740px) {
    border-left: 2px solid ${Theme.color.secondary};
    margin: 3px 3px 4px 0;
  }
`;

const InfoText: any = styled.span`
  color: ${Theme.color.white};
  font-family: ${Theme.font.primary};
  display: flex;
  font-size: 1.15rem;

  font-weight: 300;
  white-space: no-wrap;
  padding: 0 0 0 5px;
`;

const WaveContainer: any = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  width: 100%;
  flex: 1;
`;

const Wave: any = styled.img.attrs(() => ({
  src: require("../public/img/wave2.svg")
}))`
  z-index: 1;
  display: flex;
  flex: 1;
`;

const LowerContainer: any = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0 0 25rem 0;
`;

export default Home;
