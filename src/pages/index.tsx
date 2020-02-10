import styled from "styled-components";
import { useState } from "react";
import AutoSuggest from "react-autosuggest";
import { useRouter } from "next/router";

import { Theme } from "../styles";
import muns from "../public/kunnat.json";

const Home = () => {
  const router = useRouter();
  const [munValue, setMunValue] = useState("");
  const [munsSuggestions, setMunSuggestions] = useState([]);
  const [blockEnter, setBlockEnter] = useState(false);

  function getMunSuggestions(value) {
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
  }

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

  const handleKeyPress = e => {
    if (e.key.toLowerCase() === "enter" && !blockEnter) {
      goToMun();
    }
  };

  return (
    <Container>
      <Overlay>
        <AvoinLink>
          <AvoinLogo />
        </AvoinLink>
        <LogoContainer>
          <Logo />
          <LogoTextContainer>
            <LogoTitle />
            <LogoText>Hiililaskuri</LogoText>
          </LogoTextContainer>
        </LogoContainer>

        <SearchContainer onKeyPress={handleKeyPress}>
          <AutoSuggest
            suggestions={munsSuggestions}
            onSuggestionsClearRequested={() => setMunSuggestions([])}
            onSuggestionsFetchRequested={({ value }) => {
              setMunValue(value);
              setMunSuggestions(getMunSuggestions(value));
            }}
            onSuggestionSelected={(_, { suggestionValue }) =>
              console.log("Selected: " + suggestionValue)
            }
            getSuggestionValue={suggestion => suggestion.name}
            renderSuggestion={suggestion => <span>{suggestion.name}</span>}
            inputProps={{
              placeholder: "Etsi kuntaa",
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
      </Overlay>
    </Container>
  );
};

const Container: any = styled.div`
  background-image: url(${require("../public/img/forest.jpg")});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex: 1;
`;

const Overlay: any = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  background: rgba(49, 66, 52, 0.9);
`;

const SearchContainer: any = styled.div`
  display: flex;
  margin: 7rem 0 0 0;
  justify-content: center;
  padding: 0 0 20rem;
  width: 24.7rem;
  font-family: ${Theme.font.primary};

  @media only screen and (max-height: 620px) {
    margin: 3.5rem 0 0 0;
  }

  @media only screen and (max-width: 436px) {
    width: 17rem;
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
  margin: 8rem auto 0 auto;
  justify-content: flex-start;
  @media only screen and (max-height: 620px) {
    margin: 6rem auto 0 auto;
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
  width: 18rem;

  @media only screen and (max-width: 436px) {
    width: 12rem;
  }
`;

const LogoText: any = styled.p`
  color: ${Theme.color.secondary};
  font-family: ${Theme.font.primary};
  letter-spacing: 0.03rem;
  line-height: 3rem;
  font-size: 3.68rem;
  margin: 14px 0 0 -4px;
  font-weight: 700;

  @media only screen and (max-width: 436px) {
    margin: 9px 0 0 -4px;
    line-height: 2rem;
    font-size: 2.45rem;
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
  width: 18rem;

  @media only screen and (max-width: 436px) {
    width: 10rem;
  }
`;

export default Home;
