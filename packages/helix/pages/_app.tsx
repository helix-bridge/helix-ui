import '@fontsource/ibm-plex-sans';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import { ClientContext, GraphQLClient } from 'graphql-hooks';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FunctionComponent, useEffect, useState } from 'react';
import GlobalLoading from '@helix/shared/components/widget/GlobalLoading';
import { toggleTheme } from '@helix/shared/components/widget/ThemeSwitch';
import { THEME } from '@helix/shared/config/theme';
import '../styles/index.scss';
import '@helix/shared/theme/antd/index.less';
import { readStorage } from '@helix/shared/utils';
import AppLayout from '../components/AppLayout';

const isDev = process.env.NODE_ENV === 'development';

const client = new GraphQLClient({
  url: isDev ? 'http://localhost:4002/graphql' : 'https://wormhole-apollo.darwinia.network/',
});

function MyApp({ Component, pageProps }: AppProps & { Component: FunctionComponent }) {
  const router = useRouter();

  const [state, setState] = useState({
    isRouteChanging: false,
    loadingKey: 0,
  });

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setState((prevState) => ({
        ...prevState,
        isRouteChanging: true,
        // eslint-disable-next-line no-bitwise
        loadingKey: prevState.loadingKey ^ 1,
      }));
    };

    const handleRouteChangeEnd = () => {
      setState((prevState) => ({
        ...prevState,
        isRouteChanging: false,
      }));
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeEnd);
    router.events.on('routeChangeError', handleRouteChangeEnd);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeEnd);
      router.events.off('routeChangeError', handleRouteChangeEnd);
    };
  }, [router.events]);

  useEffect(() => {
    window.less = {
      async: true,
      env: 'production',
    };

    const script = document.createElement('script');

    script.addEventListener('load', () => {
      const theme = readStorage().theme;

      toggleTheme(theme ?? THEME.DARK);
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
      <GlobalLoading isRouteChanging={state.isRouteChanging} key={state.loadingKey} />
      <Head>
        <meta charSet="utf-8" />
        <title>Helix</title>
        <meta key="description" name="description" content="helix bridge" />
        <script src="/icon/iconfont.js"></script>
      </Head>
      <ClientContext.Provider value={client}>
        <AppLayout>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        </AppLayout>
      </ClientContext.Provider>
    </>
  );
}

export default appWithTranslation(MyApp);
