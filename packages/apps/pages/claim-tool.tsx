import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Claim } from '../components/ethv1/Claim';
import { Tools } from '../components/widget/Tools';
import { AccountProvider, ApiProvider, TxProvider, WalletProvider } from '../providers';

function Page() {
  return (
    <ApiProvider>
      <WalletProvider>
        <AccountProvider>
          <TxProvider>
            <div>
              <div id="app-header-container" className="hidden lg:flex items-center space-x-4 fixed top-4 z-50">
                <Tools />
              </div>

              <Claim />
            </div>
          </TxProvider>
        </AccountProvider>
      </WalletProvider>
    </ApiProvider>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default Page;
