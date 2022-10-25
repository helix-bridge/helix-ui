import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import History from '../../components/history/History';
import ActiveAccount from '../../components/widget/account/ActiveAccount';
import { AccountProvider, ApiProvider, ClaimProvider, TxProvider, WalletProvider } from '../../providers';

function Page() {
  return (
    <ApiProvider>
      <WalletProvider>
        <AccountProvider>
          <TxProvider>
            <ClaimProvider>
              <div id="app-header-container" className="hidden lg:flex items-center space-x-4 fixed top-4 z-50">
                <ActiveAccount />
              </div>

              <History />
            </ClaimProvider>
          </TxProvider>
        </AccountProvider>
      </WalletProvider>
    </ApiProvider>
  );
}

export const getServerSideProps = async ({ locale, res }: GetServerSidePropsContext) => {
  const translations = await serverSideTranslations(locale ?? 'en', ['common']);
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=100');

  return {
    props: {
      ...translations,
    },
  };
};

export default Page;
