import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { Affix, Button, Input, Spin, Tooltip } from 'antd';
import { formatDistance, getUnixTime } from 'date-fns';
import { useQuery } from 'graphql-hooks';
import { last } from 'lodash';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtual } from 'react-virtual';
import { distinctUntilChanged, filter, Subject } from 'rxjs';
import { CrossChainState } from '@helix/shared/components/widget/CrossChainStatus';
import { EllipsisMiddle } from '@helix/shared/components/widget/EllipsisMiddle';
import { Path } from '@helix/shared/config/constant';
import { useAccountStatistic, useDailyStatistic } from '@helix/shared/hooks';
import { Substrate2SubstrateRecord } from '@helix/shared/model';
import {
  convertToDvm,
  fromWei,
  getChainConfigByName,
  getDisplayName,
  getSupportedChains,
  gqlName,
  isValidAddress,
  prettyNumber,
  revertAccount,
} from '@helix/shared/utils';
import request from 'graphql-request';

const S2S_RECORDS = `
  query s2sRecords($first: Int!, $startTime: Int!, $sender: String) {
    s2sRecords(first: $first, start_timestamp: $startTime, sender: $sender) {
      id
      bridge
      fromChain
      fromChainMode
      toChain
      toChainMode
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

const supportedChains = getSupportedChains();

interface ViewBoardProps {
  title: string;
  count: string | number;
}

function ViewBoard({ title, count }: ViewBoardProps) {
  return (
    <div className="flex justify-between items-center lg:flex-col lg:gap-4 bg-gray-200 dark:bg-antDark w-full px-4 lg:px-0 py-2 lg:py-4 text-center text-gray-800 dark:text-gray-400">
      <span className="uppercase">{title}</span>
      <span className="text-xl lg:text-4xl">{count}</span>
    </div>
  );
}

function Record({ record }: { record: Substrate2SubstrateRecord }) {
  const { fromChainMode, fromChain, sender, recipient, toChain, toChainMode } = record;
  const fromConfig = getChainConfigByName(fromChain, fromChainMode);
  const toConfig = getChainConfigByName(toChain, toChainMode);
  const now = new Date().toISOString().split('.')[0];
  const fromAccount = revertAccount(sender, fromChain, fromChainMode);
  const toAccount = revertAccount(recipient, toChain, toChainMode);
  const amount = fromWei({ value: record.amount, unit: 'gwei' }, prettyNumber);

  return (
    <>
      <span className="justify-self-start ellipse-two-lines">
        {formatDistance(new Date(record.startTime), new Date(now), {
          includeSeconds: true,
          addSuffix: true,
        })}
      </span>

      <div className="flex flex-col col-span-3 overflow-hidden pl-4 pr-2">
        <Tooltip title={fromAccount}>
          <span className="capitalize">{getDisplayName(fromConfig)}</span>
        </Tooltip>
        <EllipsisMiddle isGrow>{fromAccount}</EllipsisMiddle>
      </div>

      <div className="flex flex-col col-span-3 overflow-hidden pl-2 pr-4">
        <Tooltip title={toAccount}>
          <span className="capitalize">{getDisplayName(toConfig)}</span>
        </Tooltip>
        <EllipsisMiddle isGrow>{toAccount}</EllipsisMiddle>
      </div>

      <span>{`${fromChainMode === 'dvm' ? 'x' : ''}${fromConfig?.isTest ? 'O' : ''}RING`}</span>

      <Tooltip title={amount}>
        <span className="justify-self-center max-w-full truncate">{amount}</span>
      </Tooltip>

      <span className="justify-self-center">
        {fromWei({ value: record.fee, unit: fromChainMode === 'dvm' ? 'ether' : 'gwei' })}
      </span>

      <span className="justify-self-center capitalize">{record.bridge}</span>
      <CrossChainState value={record.result} />
    </>
  );
}

const PAGE_SIZE = 50;

function Page({ records }: { records: Substrate2SubstrateRecord[] }) {
  const { t } = useTranslation('common');
  const [isValidSender, setIsValidSender] = useState(true);
  const startTime = useMemo(() => getUnixTime(new Date()), []);
  const router = useRouter();
  const { data: dailyStatistic } = useDailyStatistic();
  const { total: accountTotal } = useAccountStatistic();

  const transactionsTotal = useMemo(
    () => (dailyStatistic?.dailyStatistics || []).reduce((acc, cur) => acc + cur.dailyCount, 0) ?? '-',
    [dailyStatistic]
  );

  const { data, loading, refetch } = useQuery<{ s2sRecords: Substrate2SubstrateRecord[] }>(S2S_RECORDS, {
    variables: { first: PAGE_SIZE, startTime },
  });

  const subject = useMemo(() => new Subject<string>(), []);
  const [source, setSource] = useState<Substrate2SubstrateRecord[]>(records);
  const virtualBoxRef = useRef(null);

  const rowVirtualizer = useVirtual({
    size: source.length + 1,
    parentRef: virtualBoxRef,
    // eslint-disable-next-line no-magic-numbers
    estimateSize: useCallback(() => 60, []),
  });

  useEffect(() => {
    if (data?.s2sRecords && data.s2sRecords.length) {
      setSource((pre) => [...pre, ...data.s2sRecords]);
    }
  }, [data]);

  // eslint-disable-next-line complexity
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.virtualItems].reverse();
    const courser = last(source);

    if (lastItem && lastItem.index && !loading && courser && lastItem.index >= source.length - 1) {
      subject.next(courser.startTime);
    }
  }, [loading, rowVirtualizer.virtualItems, source, subject]);

  useEffect(() => {
    const sub$$ = subject
      .pipe(
        filter((time) => !!time),
        distinctUntilChanged()
      )
      .subscribe((time: string) => {
        refetch({ variables: { first: PAGE_SIZE, startTime: getUnixTime(new Date(time)) } });
      });

    return () => sub$$.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="grid lg:grid-cols-3 gap-0 lg:gap-6 place-items-center my-4 lg:my-6">
        <ViewBoard title={t('transactions')} count={transactionsTotal} />
        <ViewBoard title={t('unique users')} count={accountTotal} />
        <ViewBoard title={t('supported blockchains')} count={supportedChains.length} />
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
                  refetch({ variables: { first: PAGE_SIZE, startTime: getUnixTime(new Date()) } });
                  return;
                }

                try {
                  const address = isValidAddress(value, 'ethereum') ? value : convertToDvm(value);

                  setSource([]);
                  refetch({ variables: { first: PAGE_SIZE, startTime: getUnixTime(new Date()), sender: address } });
                  setIsValidSender(true);
                } catch {
                  setIsValidSender(false);
                }
              }}
              placeholder={t('Search by sender address')}
              className={`max-w-md ${isValidSender ? '' : 'border-red-400'}`}
            />

            <Button
              type="link"
              onClick={() => {
                setSource([]);
                refetch({ variables: { first: PAGE_SIZE, startTime: getUnixTime(new Date()) } });
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
                  // eslint-disable-next-line no-magic-numbers
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
                        router.push({
                          pathname: Path.transaction + '/' + record.id,
                          query: new URLSearchParams({
                            from: record.fromChain,
                            to: record.toChain,
                            fromMode: record.fromChainMode,
                            toMode: record.toChainMode,
                          }).toString(),
                        });
                      }}
                    >
                      {isLoaderRow ? (
                        data.s2sRecords.length ? (
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

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  const translations = await serverSideTranslations(locale ?? 'en', ['common']);
  const startTime = getUnixTime(new Date());
  const url =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4002/graphql'
      : 'https://wormhole-apollo.darwinia.network/';
  const records = await request(url, S2S_RECORDS, {
    first: PAGE_SIZE,
    startTime,
  }).then((res) => res && res[gqlName(S2S_RECORDS)]);

  return {
    props: {
      ...translations,
      records,
    },
  };
};

export default Page;
