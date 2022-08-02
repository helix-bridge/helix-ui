import { ArrowRightOutlined, ClockCircleOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { Affix, Button, Input, message, Table, Tooltip, Typography } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { formatDistance, fromUnixTime } from 'date-fns';
import format from 'date-fns-tz/format';
import { useQuery } from 'graphql-hooks';
import request from 'graphql-request';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, map } from 'rxjs';
import { CrossChainState } from 'shared/components/widget/CrossChainStatus';
import { Logo } from 'shared/components/widget/Logo';
import { DATE_TIME_FORMAT } from 'shared/config/constant';
import { ENDPOINT } from 'shared/config/env';
import { SYSTEM_ChAIN_CONFIGURATIONS } from 'shared/config/network';
import { DailyStatistic, HelixHistoryRecord, Network } from 'shared/model';
import { convertToDvm, gqlName, isSS58Address, isValidAddress, prettyNumber, revertAccount } from 'shared/utils/helper';
import { chainConfigs, getChainConfig, getDisplayName } from 'shared/utils/network';
import {
  getFeeAmountFromHelixRecord,
  getSentAmountFromHelixRecord,
  getTokenNameFromHelixRecord,
} from 'shared/utils/record';
import web3 from 'web3';
import { ViewBoard } from '../../components/transaction/ViewBoard';
import { ACCOUNTS, HISTORY_RECORDS, Path, STATISTICS_QUERY, TIMEPAST } from '../../config';
import { getDetailPaths } from '../../utils';

function RecordAccount({ chain, account, partner }: { chain: Network; account: string; partner: string }) {
  const chainConfig = getChainConfig(chain, SYSTEM_ChAIN_CONFIGURATIONS);
  const displayAccount = revertAccount(account, chainConfig);

  return (
    <div className="flex flex-col overflow-hidden" style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
      <span className="inline-flex items-center gap-2">
        <Logo name={chainConfig.logos[0].name} width={16} height={16} />
        <span className="capitalize">{getDisplayName(chainConfig)}</span>
      </span>
      <Tooltip
        title={
          <div>
            <span className="mr-2">{partner}: </span>
            <Typography.Text copyable>{displayAccount}</Typography.Text>
          </div>
        }
      >
        <span className="truncate">{displayAccount}</span>
      </Tooltip>
    </div>
  );
}

const PAGE_SIZE = 20;

function Page({
  records,
  count,
  dailyStatistics,
}: {
  records: HelixHistoryRecord[];
  count: number;
  dailyStatistics: DailyStatistic[];
}) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isValidSender, setIsValidSender] = useState(true);
  const { data: accountRes } = useQuery<{ accounts: { total: number } }>(ACCOUNTS);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(count);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const transactionsTotal = useMemo(
    () => (dailyStatistics || []).reduce((acc, cur) => acc + Number(cur.dailyCount), 0) ?? '-',
    [dailyStatistics]
  );

  const [account, setAccount] = useState<string | undefined>();
  const [source, setSource] = useState<HelixHistoryRecord[]>(records);
  const [loading, setLoading] = useState(false);

  const columns: ColumnType<HelixHistoryRecord>[] = [
    {
      title: t('Time'),
      dataIndex: 'startTime',
      render: (value: number) => (
        <Tooltip
          title={
            <div className="flex items-center gap-2">
              <ClockCircleOutlined />
              <span>{format(value * 1000, DATE_TIME_FORMAT)}</span>
            </div>
          }
        >
          <span>
            {formatDistance(fromUnixTime(value), new Date(new Date().toUTCString()), {
              includeSeconds: true,
              addSuffix: true,
            })}
          </span>
        </Tooltip>
      ),
    },
    {
      title: t('From'),
      dataIndex: 'fromChain',
      width: '20%',
      ellipsis: true,
      render(chain: Network, record) {
        return <RecordAccount chain={chain} account={record.sender} partner={t('Sender')} />;
      },
    },
    {
      title: '',
      key: 'direction',
      align: 'center',
      width: '50px',
      render() {
        return <ArrowRightOutlined />;
      },
    },
    {
      title: t('To'),
      dataIndex: 'toChain',
      width: '20%',
      ellipsis: true,
      render(chain: Network, record) {
        return <RecordAccount chain={chain} account={record.recipient} partner={t('Recipient')} />;
      },
    },
    {
      title: t('Amount'),
      dataIndex: 'amount',
      render(_: string, record) {
        const amount = getSentAmountFromHelixRecord(record);

        return (
          <Tooltip title={amount}>
            <span className="justify-self-center max-w-full truncate">
              {prettyNumber(amount, { decimal: 2, ignoreZeroDecimal: true })}
            </span>
            <span className="ml-2">{getTokenNameFromHelixRecord(record)}</span>
          </Tooltip>
        );
      },
    },
    {
      title: t('Fee'),
      dataIndex: 'fee',
      render(value: string, record) {
        const amount = getFeeAmountFromHelixRecord(record);

        return (
          <Tooltip title={amount}>
            <span className="justify-self-center max-w-full truncate">
              {prettyNumber(amount, { decimal: 2, ignoreZeroDecimal: true })}
            </span>
            {record.feeToken !== 'null' && <span className="ml-2">{record.feeToken}</span>}
          </Tooltip>
        );
      },
    },
    {
      title: t('Bridge'),
      dataIndex: 'bridge',
      render: (value) => (
        <span className={`justify-self-center ${/^[a-z]+[A-Z]{1}/.test(value) ? '' : 'capitalize'}`}>{value}</span>
      ),
    },
    {
      title: t('Status'),
      dataIndex: 'result',
      render: (value) => {
        return (
          <div className="flex gap-8 items-center">
            <CrossChainState value={value} />
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const acc = account && web3.utils.isAddress(account) ? account.toLowerCase() : account;
    const args = {
      page: page - 1,
      row: pageSize,
      sender: acc,
      recipient: acc,
    };

    const sub$$ = from(request(ENDPOINT, HISTORY_RECORDS, args))
      .pipe(map((res) => res && res[gqlName(HISTORY_RECORDS)]))
      .subscribe((result) => {
        setTotal(result.total);
        setSource(result.records);
      });

    return () => sub$$.unsubscribe();
  }, [account, page, pageSize]);

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-0 lg:gap-6 place-items-center py-2 lg:py-4">
        <ViewBoard title={t('transactions')} count={transactionsTotal} />
        <ViewBoard title={t('unique users')} count={accountRes?.accounts?.total ?? 0} />
        <ViewBoard title={t('supported blockchains')} count={chainConfigs.length} />
      </div>

      <Affix offsetTop={62}>
        <div className="pb-2 lg:pb-4 flex justify-between">
          <Input
            size="large"
            suffix={<SearchOutlined />}
            allowClear
            // eslint-disable-next-line complexity
            onChange={(event) => {
              const value = event.target.value;

              if (value && !web3.utils.isAddress(value) && !isSS58Address(value)) {
                setIsValidSender(false);
                return;
              }

              try {
                const address = isValidAddress(value, 'ethereum') ? value : convertToDvm(value);

                setAccount(address);
                setPage(1);
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
              if (page === 1) {
                setLoading(true);
                from(
                  request(ENDPOINT, HISTORY_RECORDS, { page: 0, row: pageSize, sender: account, recipient: account })
                )
                  .pipe(map((res) => res && res[gqlName(HISTORY_RECORDS)]))
                  .subscribe((result) => {
                    setTotal(result.total);
                    setSource(result.records);
                    setLoading(false);
                  });
              } else {
                setPage(1);
              }
            }}
            disabled={loading}
            className="flex items-center cursor-pointer"
          >
            <span className="mr-2">{t('Latest transactions')}</span>
            <SyncOutlined />
          </Button>
        </div>
      </Affix>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={source}
        size="small"
        loading={loading}
        onRow={(record) => ({
          onClick() {
            const { fromChain, toChain } = record;
            const paths = getDetailPaths(fromChain, toChain, record);

            if (paths.length) {
              router.push({
                pathname: `${Path.transaction}/${paths.join('/')}`,
                query: new URLSearchParams({
                  from: record.fromChain,
                  to: record.toChain,
                }).toString(),
              });
            } else {
              message.error(`Can not find the detail page for ${fromChain} to ${toChain}`);
            }
          },
        })}
        pagination={{ pageSize, total, current: page, size: 'default' }}
        onChange={({ current, pageSize: size }) => {
          setPage(current ?? 1);
          setPageSize(size ?? PAGE_SIZE);
        }}
        rowClassName={() => {
          return 'cursor-pointer';
        }}
        className="explorer-table"
      />
    </>
  );
}

export async function getStaticProps() {
  const translations = await serverSideTranslations('en', ['common']);

  const { records, total } = await request(ENDPOINT, HISTORY_RECORDS, {
    row: PAGE_SIZE,
    page: 0,
  }).then((res) => res && res[gqlName(HISTORY_RECORDS)]);

  const dailyStatistics = await request(ENDPOINT, STATISTICS_QUERY, { timepast: TIMEPAST }).then(
    (res) => res[gqlName(STATISTICS_QUERY)]
  );

  return {
    props: {
      ...translations,
      records,
      dailyStatistics,
      count: total,
    },
    revalidate: 10,
  };
}

export default Page;
