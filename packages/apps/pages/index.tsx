import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';
import { CrossChainDirection } from 'shared/model';
import { getDefaultDirection, getDirectionFromSettings } from 'shared/utils/helper';
import { CrossChain } from '../components/CrossChain';

const defaultDirection = getDefaultDirection();

function Page() {
  const [dir, setDir] = useState<CrossChainDirection>(defaultDirection);

  useEffect(() => {
    const loc = getDirectionFromSettings();

    setDir(loc);
  }, []);

  return (
    <>
      <CrossChain dir={dir} />
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
