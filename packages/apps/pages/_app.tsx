import '@fontsource/ibm-plex-sans';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import { ClientContext, GraphQLClient } from 'graphql-hooks';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FunctionComponent, useEffect, useState } from 'react';
import GlobalLoading from 'shared/components/widget/GlobalLoading';
import { ENDPOINT } from 'shared/config/env';
import '../bridges/register';
import AppLayout from '../components/AppLayout';
import { AccountProvider, ApiProvider, ClaimProvider, GqlProvider, TxProvider, WalletProvider } from '../providers';
import '../styles/index.scss';

const client = new GraphQLClient({
  url: ENDPOINT,
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

    script.src = 'https://cdn.bootcdn.net/ajax/libs/less.js/2.7.2/less.min.js';
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <GlobalLoading isRouteChanging={state.isRouteChanging} key={state.loadingKey} />
      <Head>
        <meta charSet="utf-8" />
        <title>Helix</title>
        <meta key="description" name="description" content="helix bridge" />
      </Head>
      <ClientContext.Provider value={client}>
        <ErrorBoundary>
          <ApiProvider>
            <WalletProvider>
              <AccountProvider>
                <TxProvider>
                  <GqlProvider>
                    <ClaimProvider>
                      <AppLayout>
                        <Component {...pageProps} />
                      </AppLayout>
                    </ClaimProvider>
                  </GqlProvider>
                </TxProvider>
              </AccountProvider>
            </WalletProvider>
          </ApiProvider>
        </ErrorBoundary>
      </ClientContext.Provider>
    </>
  );
}

export default appWithTranslation(MyApp);
