import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { Affix, Button, Input, Spin } from 'antd';
import { useQuery } from 'graphql-hooks';
import request, { gql } from 'graphql-request';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtual } from 'react-virtual';
import { ENDPOINT } from 'shared/config/env';
import { HelixHistoryRecord } from 'shared/model';
import { isS2S, isSubstrateDVM } from 'shared/utils/bridge';
import { convertToDvm, gqlName, isValidAddress } from 'shared/utils/helper';
import { chainConfigs, toVertices } from 'shared/utils/network';
import { Record } from '../../components/transaction/Record';
import { ViewBoard } from '../../components/transaction/ViewBoard';
import { Path } from '../../config';
import { useAccountStatistic, useDailyStatistic } from '../../hooks';

const HISTORY_RECORDS = gql`
  query historyRecords($row: Int!, $page: Int!, $sender: String, $recipient: String) {
    historyRecords(row: $row, page: $page, sender: $sender, recipient: $recipient) {
      id
      bridge
      fromChain
      toChain
      laneId
      nonce
      requestTxHash
      responseTxHash
      sender
      recipient
      token
      amount
      startTime
      endTime
      result
      fee
    }
  }
`;

const PAGE_SIZE = 50;

function Page({ records }: { records: HelixHistoryRecord[] }) {
  const { t } = useTranslation('common');
  const [isValidSender, setIsValidSender] = useState(true);
  const router = useRouter();
  const { data: dailyStatistic } = useDailyStatistic();
  const { total: accountTotal } = useAccountStatistic(ENDPOINT);
  const [page, setPage] = useState(1);

  const transactionsTotal = useMemo(
    () => (dailyStatistic?.dailyStatistics || []).reduce((acc, cur) => acc + cur.dailyCount, 0) ?? '-',
    [dailyStatistic]
  );

  const [account, setAccount] = useState<string | undefined>();

  const { data, loading } = useQuery<{ historyRecords: HelixHistoryRecord[] }>(HISTORY_RECORDS, {
    variables: { row: PAGE_SIZE, page, sender: account, recipient: account },
  });

  const [source, setSource] = useState<HelixHistoryRecord[]>(records);
  const virtualBoxRef = useRef(null);

  const rowVirtualizer = useVirtual({
    size: source.length + 1,
    parentRef: virtualBoxRef,
    // eslint-disable-next-line no-magic-numbers
    estimateSize: useCallback(() => 60, []),
  });

  useEffect(() => {
    if (data?.historyRecords && data.historyRecords?.length) {
      setSource((pre) => [...pre, ...data.historyRecords]);
    }
  }, [data]);

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.virtualItems].reverse();

    if (lastItem && lastItem.index && !loading && lastItem.index >= source.length - 1) {
      setPage((pre) => pre + 1);
    }
  }, [loading, rowVirtualizer.virtualItems, source]);

  useEffect(() => {
    // for refresh
    if (page === 0 && !!source.length) {
      setPage(1);
    }
  }, [page, source.length]);

  return (
    <div>
      <div className="grid lg:grid-cols-3 gap-0 lg:gap-6 place-items-center my-4 lg:my-6">
        <ViewBoard title={t('transactions')} count={transactionsTotal} />
        <ViewBoard title={t('unique users')} count={accountTotal} />
        <ViewBoard title={t('supported blockchains')} count={chainConfigs.length} />
      </div>

      <Affix offsetTop={64}>
        <div>
          <div className="flex justify-between">
            <Input
              size="large"
              suffix={<SearchOutlined />}
              allowClear
              onChange={(event) => {
                const value = event.target.value;

                if (!value) {
                  setIsValidSender(true);
                  setSource([]);
                  setAccount(undefined);
                  setPage(0);
                }

                try {
                  const address = isValidAddress(value, 'ethereum') ? value : convertToDvm(value);

                  setSource([]);
                  setAccount(address);
                  setPage(0);
                  setIsValidSender(true);
                } catch {
                  setIsValidSender(false);
                }
              }}
              placeholder={t('Search by address')}
              className={`max-w-md ${isValidSender ? '' : 'border-red-400'}`}
            />

            <Button
              type="link"
              onClick={() => {
                setSource([]);
                setPage(0);
              }}
              disabled={loading}
              className="flex items-center cursor-pointer"
            >
              <span className="mr-2">{t('Latest transactions')}</span>
              <SyncOutlined />
            </Button>
          </div>

          <div className="mt-4 lg:mt-6 grid grid-cols-12 border-b border-gray-500 items-center p-4 bg-gray-200 dark:bg-antDark">
            <span className="mr-5">{t('Time')}</span>
            <span className="col-span-3 overflow-hidden pl-4 pr-2">{t('From')}</span>
            <span className="col-span-3 overflow-hidden pl-2 pr-4">{t('To')}</span>
            <span>{t('Asset')}</span>
            <span className="justify-self-center">{t('Amount')}</span>
            <span className="justify-self-center">{t('Fee')}</span>
            <span className="justify-self-center">{t('Bridge')}</span>
            <span>{t('Status')}</span>
          </div>

          <div
            // header: 64px search box: 40px table header + margin: 78px footer 54px
            style={{ height: 'calc(100vh - 40px - 64px - 78px - 54px)' }}
            ref={virtualBoxRef}
            className="overflow-auto"
          >
            {data && (
              <div style={{ height: rowVirtualizer.totalSize, width: '100%', position: 'relative' }}>
                {rowVirtualizer.virtualItems.map((row) => {
                  const record = source[row.index];
                  const isLoaderRow = row.index > source?.length - 1;
                  const bg = row.index % 2 === 0 ? 'bg-gray-200 dark:bg-antDark' : '';

                  return (
                    <div
                      className={`grid grid-cols-12 items-center py-2 px-4 cursor-pointer transition-all duration-300 
                      hover:bg-gray-400 dark:hover:bg-gray-800 ${bg}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${row.size}px`,
                        transform: `translateY(${row.start}px)`,
                      }}
                      key={row.key}
                      onClick={() => {
                        const from = toVertices(record.fromChain);
                        const to = toVertices(record.toChain);
                        const radix = 16;
                        const paths = isS2S(from, to)
                          ? ['s2s', record.laneId + '0x' + Number(record.nonce).toString(radix)]
                          : isSubstrateDVM(from, to)
                          ? ['s2dvm', record.id]
                          : [];

                        router.push({
                          pathname: `${Path.transaction}/${paths.join('/')}`,
                          query: new URLSearchParams({
                            from: record.fromChain,
                            to: record.toChain,
                          }).toString(),
                        });
                      }}
                    >
                      {isLoaderRow ? (
                        data.historyRecords?.length ? (
                          <Spin className="col-span-full" />
                        ) : (
                          <span className="col-span-full text-center">{t('Nothing more to load')}</span>
                        )
                      ) : (
                        record && <Record record={record} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Affix>
    </div>
  );
}

export async function getStaticProps() {
  const translations = await serverSideTranslations('en', ['common']);

  const records = await request(ENDPOINT, HISTORY_RECORDS, {
    row: PAGE_SIZE,
    page: 0,
  }).then((res) => res && res[gqlName(HISTORY_RECORDS)]);

  return {
    props: {
      ...translations,
      records,
    },
    revalidate: 10,
  };
}

export default Page;
