import { ClientContext, GraphQLClient } from 'graphql-hooks';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { FunctionComponent, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import '../theme/antd/index.less';
import '../styles/index.scss';
import '@fontsource/ibm-plex-sans';
import { NETWORK_DARK_THEME, SKIN_THEME } from '../config/theme';
import { readStorage } from '../utils';

const isDev = process.env.NODE_ENV === 'development';

const client = new GraphQLClient({
  url: isDev ? 'http://localhost:4000/' : 'https://wormhole-apollo.darwinia.network/',
});

function MyApp({ Component, pageProps }: AppProps & { Component: FunctionComponent }) {
  useEffect(() => {
    window.less = {
      async: true,
      env: 'production',
    };

    const script = document.createElement('script');

    script.addEventListener('load', () => {
      const theme = readStorage().theme;

      window.less
        .modifyVars({
          ...SKIN_THEME[theme ?? 'dark'],
          ...SKIN_THEME.vars,
          ...NETWORK_DARK_THEME['pangolin'],
        })
        .catch((error: unknown) => {
          console.error('🚀 ~ modify css variable failed: ', error);
        });
    });

    script.src = 'https://cdn.bootcdn.net/ajax/libs/less.js/2.7.2/less.min.js';
    document.body.appendChild(script);

    const css = document.createElement('link');
    css.href = '/color.less';
    css.rel = 'stylesheet/less';
    css.type = 'text/css';
    document.body.appendChild(css);
  }, []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Helix</title>
        <meta key="description" name="description" content="helix bridge" />
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
