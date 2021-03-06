import { Affix, Radio, Tabs } from 'antd';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isTestChain } from 'shared/config/env';
import { darwiniaConfig, ethereumConfig, pangolinConfig, ropstenConfig } from 'shared/config/network';
import { EthereumChainConfig, PolkadotChainConfig } from 'shared/model';
import { getDisplayName } from 'shared/utils/network';
import { Claim as DarwiniaEthereumClaim } from '../../bridges/ethereum-darwinia';
import { useApi } from '../../providers';

function Page() {
  const { t } = useTranslation();
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const { setDeparture } = useApi();

  const [activeTab, setActiveTab] = useState('e2d');

  const ethereumDarwiniaDirection = useMemo<[PolkadotChainConfig, EthereumChainConfig]>(
    () => (isTestChain ? [pangolinConfig, ropstenConfig] : [darwiniaConfig, ethereumConfig]),
    []
  );

  useEffect(() => {
    setDeparture(ethereumDarwiniaDirection[0]);
  }, [ethereumDarwiniaDirection, setDeparture]);

  return (
    <>
      <Affix offsetTop={63}>
        <div className="flex justify-between items-center py-4" style={{ background: '#020822' }}>
          <Radio.Group
            onChange={(event) => {
              const num = Number(event.target.value);

              setConfirmed(num < 0 ? null : !!num);
            }}
            defaultValue={'-1'}
            buttonStyle="solid"
            size="large"
          >
            <Radio.Button value="-1">{t('All')}</Radio.Button>
            <Radio.Button value="0">{t('Pending')}</Radio.Button>
            <Radio.Button value="1">{t('Success')}</Radio.Button>
          </Radio.Group>
        </div>
      </Affix>

      <div className="bg-gray-200 dark:bg-antDark px-4 pb-4">
        <Tabs onChange={(event) => setActiveTab(event)} size="large" className="mt-4" defaultActiveKey={activeTab}>
          <Tabs.TabPane tab={ethereumDarwiniaDirection.map((item) => getDisplayName(item)).join(' -> ')} key="d2e">
            <DarwiniaEthereumClaim confirmed={confirmed} direction={ethereumDarwiniaDirection} />
          </Tabs.TabPane>
        </Tabs>
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
