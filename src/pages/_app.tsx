import React from "react";
import App from "next/app";
import { ThemeProvider } from "styled-components";

import { Theme, GlobalStyle } from "../styles";

const MyApp = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={Theme}>
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default MyApp;
