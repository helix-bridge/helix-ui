import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { Badge, Button, Input, message, Table, Tabs, Tooltip } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { format } from 'date-fns';
import { isAddress } from 'ethers/lib/utils';
import { useManualQuery, useQuery } from 'graphql-hooks';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { from } from 'rxjs/internal/observable/from';
import { map } from 'rxjs/internal/operators/map';
import { Logo } from 'shared/components/widget/Logo';
import { DATE_TIME_FORMAT, RecordStatus } from 'shared/config/constant';
import { SYSTEM_CHAIN_CONFIGURATIONS } from 'shared/config/network';
import { HelixHistoryRecord, Network } from 'shared/model';
import { convertToDvm, revertAccount } from 'shared/utils/helper/address';
import { prettyNumber } from 'shared/utils/helper/balance';
import { gqlName } from 'shared/utils/helper/common';
import { isSS58Address, isValidAddress } from 'shared/utils/helper/validator';
import { getDetailPaths } from 'utils/record/path';
import { Path } from '../../config';
import { HISTORY_RECORDS_IN_RESULTS, STATUS_STATISTICS } from '../../config/gql';
import { useITranslation } from '../../hooks';
import { Paginator } from '../../model';
import { useAccount } from '../../providers';
import { useClaim } from '../../providers/claim';
import { getChainConfig, getDisplayName } from '../../utils/network';
import { getReceivedAmountFromHelixRecord, getSentAmountFromHelixRecord } from '../../utils/record/record';
import { Pending } from './Pending';
import { PendingToClaim } from './PendingToClaim';
import { PendingToRefund } from './PendingToRefund';
import { Refunded } from './Refunded';

const paginatorDefault: Paginator = { row: 20, page: 0 };

function Destination({ chain, amount, symbol }: { chain: Network; amount: string; symbol: string }) {
  const chainConfig = getChainConfig(chain, SYSTEM_CHAIN_CONFIGURATIONS);

  return (
    <div className="flex items-center gap-2">
      <Logo name={chainConfig.logos[0].name} width={36} height={36} />

      <div className="flex flex-col">
        <Tooltip title={amount}>
          <span className="justify-self-center max-w-full truncate">
            {prettyNumber(amount, { decimal: 2, ignoreZeroDecimal: true })}
          </span>

          <span className="ml-2">{symbol}</span>
        </Tooltip>

        <span className="text-gray-400 text-xs">on {getDisplayName(chainConfig)}</span>
      </div>
    </div>
  );
}

export default function History() {
  const { t } = useITranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<number>(-1);
  const { account } = useAccount();
  const [paginator, setPaginator] = useState<Paginator>(paginatorDefault);
  const { refundedList } = useClaim();
  const [goOnAmount, setGoOnAmount] = useState(0);

  const [isValidSender, setIsValidSender] = useState(true);

  const [searchAccount, setSearchAccount] = useState<string | undefined>(() => {
    const value = router.query.account;

    if (typeof value === 'string') {
      return isValidAddress(value, 'ethereum') ? value : convertToDvm(value);
    } else {
      return undefined;
    }
  });

  const results = useMemo(() => {
    if (+activeTab < 0) {
      return undefined;
    } else if (+activeTab === 0) {
      return [RecordStatus.pending, RecordStatus.pendingToClaim, RecordStatus.pendingToRefund];
    } else if (+activeTab === 1) {
      return [RecordStatus.success];
    } else {
      return [RecordStatus.refunded];
    }
  }, [activeTab]);

  const [requestStatisticRecords] = useManualQuery(STATUS_STATISTICS);

  const {
    loading,
    data = { [gqlName(HISTORY_RECORDS_IN_RESULTS)]: { total: 0, records: [] as HelixHistoryRecord[] } },
    refetch,
  } = useQuery(HISTORY_RECORDS_IN_RESULTS, {
    variables: {
      ...paginator,
      sender: searchAccount,
      recipient: searchAccount,
      results,
    },
  });

  const records = useMemo<HelixHistoryRecord[]>(() => {
    return data[gqlName(HISTORY_RECORDS_IN_RESULTS)].records.map((record: HelixHistoryRecord) => {
      if (refundedList.find((item) => item.id === record.id)) {
        record.result = RecordStatus.pendingToConfirmRefund;
      }

      return record;
    });
  }, [refundedList, data]);

  const total = useMemo(() => data[gqlName(HISTORY_RECORDS_IN_RESULTS)].total, [data]);

  const fetchGoOnAmount = useCallback(
    (address: string) => {
      return from(
        requestStatisticRecords({
          variables: {
            results: [RecordStatus.pendingToClaim, RecordStatus.pendingToRefund],
            sender: isValidAddress(address, 'ethereum') ? address : convertToDvm(address),
          },
        })
      )
        .pipe(map(({ data: res }) => res && res[gqlName(STATUS_STATISTICS)]))
        .subscribe((res) => {
          setGoOnAmount(res.total);
        });
    },
    [requestStatisticRecords]
  );

  const columns: ColumnType<HelixHistoryRecord>[] = [
    {
      title: t('From'),
      width: '16%',
      dataIndex: 'fromChain',
      render(chain: Network, record: HelixHistoryRecord) {
        const amount = getSentAmountFromHelixRecord(record);

        return <Destination amount={amount} symbol={record.sendToken} chain={chain} />;
      },
    },
    {
      title: t('To'),
      width: '16%',
      dataIndex: 'toChain',
      render(chain: Network, record) {
        const amount = getReceivedAmountFromHelixRecord(record);

        return <Destination amount={amount} symbol={record.recvToken} chain={chain} />;
      },
    },
    {
      title: t('Sender'),
      dataIndex: 'sender',
      ellipsis: true,
      render(_: string, record) {
        const chainConfig = getChainConfig(record.fromChain, SYSTEM_CHAIN_CONFIGURATIONS);

        return revertAccount(account, chainConfig);
      },
    },
    {
      title: t('Receiver'),
      dataIndex: 'recipient',
      ellipsis: true,
      render(_: string, record) {
        const chainConfig = getChainConfig(record.toChain, SYSTEM_CHAIN_CONFIGURATIONS);

        return revertAccount(account, chainConfig);
      },
    },
    {
      title: t('Bridge'),
      dataIndex: 'bridge',
      align: 'center',
      width: '5%',
      render: (value) => (
        <Image
          alt="..."
          src={`/image/bridges/${value.split('-')[0].toLowerCase()}-bridge.png`}
          width={28}
          height={28}
        />
      ),
    },
    {
      title: t('Status'),
      dataIndex: 'result',
      align: 'right',
      width: '10%',
      // eslint-disable-next-line complexity
      render: (value: number, record: HelixHistoryRecord) => {
        const { fromChain, toChain } = record;
        return (
          <div
            onClick={() => {
              const paths = getDetailPaths(fromChain, toChain, record);
              const query = new URLSearchParams({
                from: record.fromChain,
                to: record.toChain,
              }).toString();

              if (paths.length) {
                window.open(`transaction/${paths.join('/')}?${query}`, '_blank');
              }
            }}
          >
            <div className="mb-2 whitespace-nowrap text-xs">{format(record.startTime * 1000, DATE_TIME_FORMAT)}</div>

            {record.result === RecordStatus.pending && <Pending record={record} />}

            {record.result === RecordStatus.pendingToClaim && <PendingToClaim record={record} />}

            {record.result === RecordStatus.pendingToRefund && (
              <PendingToRefund record={record} onSuccess={() => fetchGoOnAmount(account)} />
            )}

            {record.result === RecordStatus.success && <div className="text-helix-green">{t('Success')}</div>}

            {record.result === RecordStatus.pendingToConfirmRefund && (
              <div className="text-helix-blue">{t('Refund Processing')}</div>
            )}

            {record.result === RecordStatus.refunded && <Refunded record={record} />}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="mt-2 lg:mt-4 pb-2 lg:pb-4 flex justify-between items-end">
        <Input
          size="large"
          suffix={<SearchOutlined />}
          allowClear
          defaultValue={router.query.account ?? undefined}
          // eslint-disable-next-line complexity
          onChange={(event) => {
            const value = event.target.value;

            if (value && !isAddress(value) && !isSS58Address(value)) {
              setIsValidSender(false);
              return;
            }

            try {
              const address = isValidAddress(value, 'ethereum') ? value : convertToDvm(value);

              setSearchAccount(address ? address : undefined);
              setPaginator(paginatorDefault);
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
            refetch({ ...paginator, sender: searchAccount, recipient: searchAccount });
          }}
          disabled={loading}
          className="flex items-center cursor-pointer px-0"
        >
          <span className="mr-2">{t('Latest transactions')}</span>
          <SyncOutlined />
        </Button>
      </div>

      <Tabs
        defaultActiveKey="-1"
        onTabClick={(key) => {
          const res = Number(key) - 1;

          setActiveTab(res);
          setPaginator(paginatorDefault);
        }}
        className="explorer-tabs"
        // eslint-disable-next-line complexity
        items={['All', 'Pending', 'Success', 'Refunded'].map((label, index) => ({
          label:
            label === 'Pending' ? (
              <Badge count={goOnAmount} offset={[10, 0]} color="blue">
                <span>{t(label)}</span>
              </Badge>
            ) : (
              t(label)
            ),
          key: String(index),
          children: (
            <>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={records}
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
                pagination={{
                  pageSize: paginator.row,
                  total,
                  current: paginator.page + 1,
                  size: 'default',
                }}
                onChange={({ current, pageSize: size }) => {
                  setPaginator({ page: current ?? 1, row: size ?? paginatorDefault.row });
                }}
                rowClassName={() => {
                  return 'cursor-pointer';
                }}
                className="explorer-table"
              />
            </>
          ),
        }))}
      ></Tabs>
    </>
  );
}
