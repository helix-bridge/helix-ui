import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Claim } from '../components/ethv1/Claim';
import { AccountProvider, ApiProvider, TxProvider, WalletProvider } from '../providers';

function Page() {
  return (
    <ApiProvider>
      <WalletProvider>
        <AccountProvider>
          <TxProvider>
            <Claim />
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
