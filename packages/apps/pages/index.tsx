import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CrossChain } from '../components/CrossChain';

function Page() {
  // const [visible, setVisible] = useState(true);
  const { t } = useTranslation();
  void t;

  return (
    <>
      <CrossChain />

      {/* <DisclaimerModal visible={visible} onCancel={() => setVisible(false)} onOk={() => setVisible(false)} /> */}
    </>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default Page;
