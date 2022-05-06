import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';
import { DEFAULT_DIRECTION } from 'shared/config/constant';
import { CrossChainDirection } from 'shared/model';
import { getDirectionFromSettings } from 'shared/utils';
import { CrossChain } from '../components/CrossChain';

function Page() {
  const [dir, setDir] = useState<CrossChainDirection>(DEFAULT_DIRECTION);

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
