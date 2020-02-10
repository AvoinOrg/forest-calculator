import React from "react";
import Head from "next/head";
import App, { Container } from "next/app";
import { ThemeProvider } from "styled-components";

import { Theme, GlobalStyle } from "../styles";

class MyApp extends App {
  public render() {
    const { Component, pageProps } = this.props;
    return (
      <Container>
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
      </Container>
    );
  }
}

export default MyApp;
