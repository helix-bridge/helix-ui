import { Affix, Checkbox, Pagination, Radio, Spin, Tabs } from 'antd';
import { upperFirst } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { darwiniaConfig, ethereumConfig, pangolinConfig, ropstenConfig } from 'shared/config/network';
import { EthereumChainConfig, PolkadotChainConfig } from 'shared/model';
import { Darwinia2EthereumRecord, Ethereum2DarwiniaRecord } from '../../bridges/ethereum-darwinia';
import { useRecords } from '../../bridges/ethereum-darwinia/hooks';
import { Paginator } from '../../model';
import { useAccount, useApi } from '../../providers';

const SOURCE_DATA_DEFAULT = { count: 0, list: [] };
const PAGINATOR_DEFAULT = { row: 10, page: 0 };

// eslint-disable-next-line complexity
export function CrossChainRecord() {
  const { t } = useTranslation();
  const { departureConnection } = useApi();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const { account } = useAccount();
  const [activeTab, setActiveTab] = useState('e2d');
  const { fetchIssuingRecords, fetchRedeemRecords } = useRecords();
  const [isTestChain, setIsTest] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ethereumDarwinia, setEthereumDarwiniaData] = useState<{ count: number; list: any[] }>({ count: 0, list: [] });

  const ethereumDarwiniaDirection = useMemo<[EthereumChainConfig, PolkadotChainConfig]>(
    () => (isTestChain ? [ropstenConfig, pangolinConfig] : [ethereumConfig, darwiniaConfig]),
    [isTestChain]
  );

  const [sourceData, setSourceData] = useState<{
    count: number;
    list: Record<string, string | number | null | undefined>[];
  }>(SOURCE_DATA_DEFAULT);

  const [paginator, setPaginator] = useState<Paginator>(PAGINATOR_DEFAULT);

  // eslint-disable-next-line complexity
  useEffect(() => {
    if (!account) {
      return;
    }

    if (activeTab === 'history') {
      setSourceData(SOURCE_DATA_DEFAULT);
    } else {
      const query = departureConnection.type === 'metamask' ? fetchRedeemRecords : fetchIssuingRecords;

      query({ address: account, direction: ethereumDarwiniaDirection, confirmed, paginator }).subscribe({
        next: (result) => setEthereumDarwiniaData(result),
        error: () => setLoading(false),
        complete: () => setLoading(false),
      });
    }
  }, [
    account,
    activeTab,
    confirmed,
    departureConnection.type,
    ethereumDarwiniaDirection,
    fetchIssuingRecords,
    fetchRedeemRecords,
    paginator,
  ]);

  return (
    <>
      <Affix offsetTop={63}>
        <div className="flex justify-between items-center mb-8">
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
            <Radio.Button value="1">{t('Pending')}</Radio.Button>
            <Radio.Button value="0">{t('Success')}</Radio.Button>
          </Radio.Group>

          <Checkbox onChange={(event) => setIsTest(event.target.checked)} defaultChecked={isTestChain}>
            {t('View Test Chain')}
          </Checkbox>
        </div>
      </Affix>

      <Spin spinning={loading} size="large">
        <div className="bg-gray-200 dark:bg-antDark px-4">
          <Tabs onChange={(event) => setActiveTab(event)} size="large" className="mt-4" defaultActiveKey={activeTab}>
            <Tabs.TabPane tab={t('Cross History')} key="history">
              unimplemented
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={t(ethereumDarwiniaDirection.map((item) => upperFirst(item.name)).join(' <-> '))}
              key="e2d"
            >
              {ethereumDarwinia.list.map((item) =>
                departureConnection.type === 'metamask' ? (
                  <Ethereum2DarwiniaRecord
                    record={item}
                    key={item.blockTimestamp}
                    departure={ethereumDarwiniaDirection[0]}
                    arrival={ethereumDarwiniaDirection[1]}
                  />
                ) : (
                  <Darwinia2EthereumRecord
                    record={item}
                    key={item.blockTimestamp}
                    departure={ethereumDarwiniaDirection[0]}
                    arrival={ethereumDarwiniaDirection[1]}
                  />
                )
              )}
            </Tabs.TabPane>
          </Tabs>

          <div className="w-full max-w-6xl flex justify-center items-center mx-auto mt-4">
            {!!sourceData.count && (
              <Pagination
                onChange={(page: number) => {
                  setPaginator({ ...paginator, page: page - 1 });
                }}
                current={paginator.page + 1}
                pageSize={paginator.row}
                total={sourceData.count ?? 0}
                showTotal={() => t('Total {{total}}', { total: sourceData.count })}
              />
            )}
          </div>
        </div>
      </Spin>
    </>
  );
}
