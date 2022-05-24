import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';
import { DEFAULT_DIRECTION } from 'shared/config/constant';
import { CrossChainDirection } from 'shared/model';
import { getDirectionFromSettings, readStorage } from 'shared/utils/helper';
import { CrossChain } from '../components/CrossChain';
import { DisclaimerModal } from '../components/widget/DisclaimerModal';

function Page() {
  const [dir, setDir] = useState<CrossChainDirection>(DEFAULT_DIRECTION);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const loc = getDirectionFromSettings();
    const warning = readStorage().warning;

    setVisible(warning ?? true);

    setDir(loc);
  }, []);

  return (
    <>
      <CrossChain dir={dir} />
      <DisclaimerModal visible={visible} onCancel={() => setVisible(false)} onOk={() => setVisible(false)} />
    </>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default Page;
