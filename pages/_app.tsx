// import '../styles/globals.less';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { FunctionComponent } from 'react';
import { ClientContext, GraphQLClient } from 'graphql-hooks';
import AppLayout from '../components/AppLayout';
import Head from 'next/head';

const isDev = process.env.NODE_ENV === 'development';

const client = new GraphQLClient({
  url: isDev ? 'http://localhost:4000/' : 'https://wormhole-apollo.darwinia.network/',
});

function MyApp({ Component, pageProps }: AppProps & { Component: FunctionComponent }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Helix</title>
        <meta key="description" name="description" content="helix bridge" />
        {/* <link rel="stylesheet/less" type="text/css" href="/color.less" /> */}
        <script type="text/javascript" src="/less.min.js"></script>
      </Head>
      <ClientContext.Provider value={client}>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </ClientContext.Provider>
    </>
  );
}

export default appWithTranslation(MyApp);
