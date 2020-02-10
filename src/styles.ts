import { createGlobalStyle, css } from "styled-components";

// try coolors.co
export const Theme: any = {
  color: {
    primary: "rgb(49, 66, 52)",
    primaryLight: "#97A89A",
    secondary: "rgb(187, 160, 69)",
    secondaryLight: "#DDCFA2",
    brown: "rgb(76, 65, 61)",
    beige: "rgb(219, 209, 201)",
    red: "rgb(164, 71, 72)"
  },
  font: {
    primary: "Museo Sans",
    secondary: "EngschriftDIND"
  }
};

export const GlobalStyle: any = createGlobalStyle`
    ${({ theme }: any): any => css`
      @font-face {
        font-family: "Museo Sans";
        src: local("Museo Sans"), local("MuseoSans"),
          url(${require("./public/fonts/MuseoSans-500.otf")});
        font-weight: 500;
        font-style: normal;
      }

      @font-face {
        font-family: "Museo Sans";
        src: local("Museo Sans"), local("MuseoSans"),
          url(${require("./public/fonts/MuseoSans-700.otf")});
        font-weight: 700;
        font-style: normal;
      }

      @font-face {
        font-family: "EngschriftDIND";
        src: local("EngschriftDIND"), local("Engschrift DIND"),
          url(${require("./public/fonts/EngschriftDIND.otf")});
        font-weight: 500;
        font-style: normal;
      }

      body {
        font-family: "Museo Sans", sans-serif;
        font-family: "EngschriftDIND", sans-serif;

        font-size: 16px;
        color: ${theme.color.primary};
        background-color: ${theme.color.secondary};
        box-sizing: border-box;
        &:focus {
          outline: 0;
        }
        display: flex;
        flex: 1;
        margin: 0;
        padding: 0;
      }

      html {
        min-height: 100%;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        display: flex;
      }

      #__next {
        display: flex;
        flex: 1;
      }

      #__next-prerender-indicator {
        display: none;
      }

      #root {
        display: flex;
        flex: 1;
      }

      .App {
        font-family: sans-serif;
        text-align: center;
      }

      .react-autosuggest__container {
        position: relative;
        display: flex;
        flex: 1;
      }

      .react-autosuggest__input {
        display: flex;
        flex: 1;
        height: 30px;
        padding: 10px 20px;
        font-weight: 300;
        font-family: "Museo Sans";
        font-size: 16px;
        border: 1px solid #aaa;
        border-radius: 4px 0 0 4px;
      }

      .react-autosuggest__input--focused {
        outline: none;
      }

      .react-autosuggest__input--open {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }

      .react-autosuggest__suggestions-container {
        display: none;
      }

      .react-autosuggest__suggestions-container--open {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 51px;
        left: 0;
        right: 0;
        border: 1px solid #aaa;
        background-color: #fff;
        font-weight: 300;
        font-size: 16px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        z-index: 2;
      }

      .react-autosuggest__suggestions-list {
        margin: 0;
        padding: 0;
        list-style-type: none;
        max-height: 200px;
        overflow-y: auto;
      }

      .react-autosuggest__suggestion {
        cursor: pointer;
        padding: 10px 20px;
      }

      .react-autosuggest__suggestion--highlighted {
        background-color: #ddd;
      }

      .react-autosuggest__input::placeholder {
        opacity: 1;
        color: rgb(170, 170, 170);
      }

      .react-autosuggest__input:-ms-input-placeholder {
        color: rgb(170, 170, 170);
      }

      .react-autosuggest__input::-ms-input-placeholder {
        color: rgb(170, 170, 170);
      }
    `}`;
