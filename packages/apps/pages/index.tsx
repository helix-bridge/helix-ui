import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { TransferInput } from '../components/TransferInput';
import { BridgeSelector } from '../components/BridgeSelector';

function Page() {
  const { t } = useTranslation();
  void t;

  return (
    <>
      <div className="flex">
        <TransferInput />
        <BridgeSelector />
      </div>
    </>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default Page;
