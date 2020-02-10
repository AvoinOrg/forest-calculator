import React from "react";
import Head from "next/head";
import { ThemeProvider } from "styled-components";

import { Theme, GlobalStyle } from "../styles";

const MyApp = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Arvometsä hiililaskuri</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
      </Head>
      <ThemeProvider theme={Theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
};

export default MyApp;
