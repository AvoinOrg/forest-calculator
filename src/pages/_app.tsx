import React from "react";
import Head from "next/head";
import App from "next/app";
import { ThemeProvider } from "styled-components";

import { Theme, GlobalStyle } from "../styles";

class MyApp extends App {
  public render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <title>Arvometsä Metsälaskuri</title>
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
  }
}

export default MyApp;
