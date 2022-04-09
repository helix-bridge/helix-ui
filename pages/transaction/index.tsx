import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { Affix, Button, Input, Spin } from 'antd';
import { formatDistanceToNow, getUnixTime } from 'date-fns';
import { useQuery } from 'graphql-hooks';
import { last } from 'lodash';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtual } from 'react-virtual';
import { distinctUntilChanged, filter, Subject } from 'rxjs';
import { Party } from '../../components/transaction/Party';
import { CrossChainState } from '../../components/widget/CrossChainStatus';
import { Path } from '../../config/constant';
import { useAccountStatistic, useDailyStatistic } from '../../hooks';
import { Network, Substrate2SubstrateRecord } from '../../model';
import {
  convertToDvm,
  fromWei,
  getChainConfigByName,
  getSupportedChains,
  isValidAddress,
  prettyNumber,
} from '../../utils';

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
    <div className="flex justify-between items-center lg:flex-col lg:gap-4 bg-antDark w-full px-4 lg:px-0 py-2 lg:py-4 text-center">
      <span className="text-gray-400 uppercase">{title}</span>
      <span className="text-xl lg:text-4xl">{count}</span>
    </div>
  );
}

function Record({ record }: { record: Substrate2SubstrateRecord }) {
  const { fromChainMode, fromChain } = record;
  const config = getChainConfigByName(fromChain as Network);

  return (
    <>
      <span className="justify-self-start whitespace-nowrap">
        <Link
          href={{
            pathname: Path.transaction + '/' + record.id,
            query: new URLSearchParams({
              from: record.fromChain,
              to: record.toChain,
              fromMode: record.fromChainMode,
              toMode: record.toChainMode,
            }).toString(),
            // state: record,
          }}
        >
          {formatDistanceToNow(new Date(record.startTime), { includeSeconds: true, addSuffix: true })}
        </Link>
      </span>
      <Party
        chain={record.fromChain}
        account={record.sender}
        mode={record.fromChainMode}
        className="col-span-3 overflow-hidden"
      />
      <Party
        chain={record.toChain}
        account={record.recipient}
        mode={record.toChainMode}
        className="col-span-3 overflow-hidden"
      />
      <span>{`${fromChainMode === 'dvm' ? 'x' : ''}${config?.isTest ? 'O' : ''}RING`}</span>
      <span>{fromWei({ value: record.amount, unit: 'gwei' }, prettyNumber)}</span>
      <span>NAN</span>
      <span>{record.bridge}</span>
      <CrossChainState value={record.result} />
    </>
  );
}

const PAGE_SIZE = 50;

function Page() {
  const { t } = useTranslation('common');
  const [isValidSender, setIsValidSender] = useState(true);
  const startTime = useMemo(() => getUnixTime(new Date()), []);
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
  const [source, setSource] = useState<Substrate2SubstrateRecord[]>([]);
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
                  refetch({ variables: { first: PAGE_SIZE, startTime: getUnixTime(new Date()) } });
                  return;
                }

                try {
                  const address = isValidAddress(value, 'ethereum') ? value : convertToDvm(value);

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
                refetch({ variables: { first: PAGE_SIZE, startTime: getUnixTime(new Date()) } });
              }}
              disabled={loading}
              className="flex items-center cursor-pointer"
            >
              <span className="mr-2">{t('Latest transactions')}</span>
              <SyncOutlined />
            </Button>
          </div>

          <div className="mt-4 lg:mt-6 grid grid-cols-12 border-b border-gray-500 items-center py-2 px-4">
            <span>{t('Time')}</span>
            <span className="col-span-3 overflow-hidden">{t('From')}</span>
            <span className="col-span-3 overflow-hidden">{t('To')}</span>
            <span>{t('Asset')}</span>
            <span>{t('Amount')}</span>
            <span>{t('Fee')}</span>
            <span>{t('Bridge')}</span>
            <span>{t('Status')}</span>
          </div>

          <div style={{ height: 'calc(100vh - 40px - 64px - 78px)' }} ref={virtualBoxRef} className="overflow-auto">
            {data && (
              <div style={{ height: rowVirtualizer.totalSize, width: '100%', position: 'relative' }}>
                {rowVirtualizer.virtualItems.map((row) => {
                  const record = source[row.index];
                  const isLoaderRow = row.index > source.length - 1;

                  return (
                    <div
                      // eslint-disable-next-line no-magic-numbers
                      className={`grid grid-cols-12 items-center py-2 px-4 ${row.index % 2 === 0 ? 'bg-antDark' : ''}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${row.size}px`,
                        transform: `translateY(${row.start}px)`,
                      }}
                      key={row.key}
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

export default Page;