import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { Badge, Button, Input, message, Table, Tabs } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { format } from 'date-fns';
import { isAddress } from 'ethers/lib/utils';
import { useQuery } from 'graphql-hooks';
import last from 'lodash/last';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { DATE_TIME_FORMAT, RecordStatus } from 'shared/config/constant';
import { SYSTEM_CHAIN_CONFIGURATIONS } from 'shared/config/network';
import { HelixHistoryRecord, Network } from 'shared/model';
import { convertToDvm, revertAccount } from 'shared/utils/helper/address';
import { gqlName, toMiddleSplitNaming } from 'shared/utils/helper/common';
import { isSS58Address, isValidAddress } from 'shared/utils/helper/validator';
import { getDetailPaths } from 'utils/record/path';
import { Path } from '../../config';
import { HISTORY_RECORDS_IN_RESULTS } from '../../config/gql';
import { useITranslation } from '../../hooks';
import { Paginator } from '../../model';
import { useAccount } from '../../providers';
import { useClaim } from '../../providers/claim';
import { chainConfigs, getChainConfig, getDisplayName } from '../../utils/network';
import { getReceivedAmountFromHelixRecord, getSentAmountFromHelixRecord } from '../../utils/record/record';
import { Pending } from './Pending';
import { Refunded } from './Refunded';

const paginatorDefault: Paginator = { row: 20, page: 0 };

function Destination({ chain, amount, symbol }: { chain: Network; amount: string; symbol: string }) {
  const chainConfig = getChainConfig(chain, SYSTEM_CHAIN_CONFIGURATIONS);

  return (
    <div className="flex items-center gap-2">
      <Logo name={chainConfig.logos[0].name} width={36} height={36} />

      <div className="flex flex-col">
        <div className="flex items-center" style={{ maxWidth: '10em' }}>
          <span style={{ maxWidth: '6em' }} className="inline-block truncate" title={amount}>
            {amount}
          </span>

          <span className="ml-2">{symbol}</span>
        </div>

        <span className="text-gray-400 text-xs">{getDisplayName(chainConfig)}</span>
      </div>
    </div>
  );
}

const toSearchableAccount = (account: string | undefined) => {
  if (!account) {
    return undefined;
  }

  const address = isValidAddress(account, 'ethereum') ? account : convertToDvm(account);

  return address ? address.toLowerCase() : undefined;
};

export default function History() {
  const { t } = useITranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<number>(-1);
  const [paginator, setPaginator] = useState<Paginator>(paginatorDefault);
  const { refundedList } = useClaim();
  const { account } = useAccount();
  const [isValidSender, setIsValidSender] = useState(true);

  const [searchAccount, setSearchAccount] = useState<string | undefined>(router.query.account as string | undefined);

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

  const {
    loading,
    data = { [gqlName(HISTORY_RECORDS_IN_RESULTS)]: { total: 0, records: [] as HelixHistoryRecord[] } },
    refetch,
  } = useQuery(HISTORY_RECORDS_IN_RESULTS, {
    variables: {
      ...paginator,
      sender: toSearchableAccount(searchAccount),
      recipient: toSearchableAccount(searchAccount),
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

  useEffect(() => {
    setSearchAccount(account);
  }, [account]);

  const columns: ColumnType<HelixHistoryRecord>[] = [
    {
      title: t('From'),
      width: '16%',
      dataIndex: 'fromChain',
      filters: chainConfigs.map((config) => ({ text: getDisplayName(config), value: config.name })),
      onFilter: (value, record: HelixHistoryRecord) => record.fromChain === value,
      render(chain: Network, record: HelixHistoryRecord) {
        const amount = getSentAmountFromHelixRecord(record);

        return <Destination amount={amount} symbol={record.sendToken} chain={chain} />;
      },
    },
    {
      title: t('To'),
      width: '16%',
      filters: chainConfigs.map((config) => ({ text: getDisplayName(config), value: config.name })),
      onFilter: (value, record: HelixHistoryRecord) => record.toChain === value,
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
      render(value: string, record) {
        const chainConfig = getChainConfig(record.fromChain, SYSTEM_CHAIN_CONFIGURATIONS);

        return revertAccount(value, chainConfig);
      },
    },
    {
      title: t('Receiver'),
      dataIndex: 'recipient',
      ellipsis: true,
      render(value: string, record) {
        const chainConfig = getChainConfig(record.toChain, SYSTEM_CHAIN_CONFIGURATIONS);

        return revertAccount(value, chainConfig);
      },
    },
    {
      title: t('Bridge'),
      dataIndex: 'bridge',
      align: 'center',
      width: 90,
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
      width: 150,
      // eslint-disable-next-line complexity
      render: (value: number, record: HelixHistoryRecord) => {
        const { result, startTime } = record;
        const content = (
          <div
            onClick={() => {
              const paths = getDetailPaths(record);

              if (paths.length) {
                window.open(`transaction/${paths.join('/')}`, '_blank');
              }
            }}
          >
            <div className="mb-2 whitespace-nowrap text-xs">{format(startTime * 1000, DATE_TIME_FORMAT)}</div>

            {result <= RecordStatus.pendingToClaim && <Pending record={record} />}

            {result === RecordStatus.success && <div className="text-helix-green">{t('Success')}</div>}

            {result === RecordStatus.pendingToConfirmRefund && (
              <div className="text-helix-blue">{t('Refund Processing')}</div>
            )}

            {result === RecordStatus.refunded && <Refunded record={record} />}
          </div>
        );

        return result === RecordStatus.pendingToClaim || result === RecordStatus.pendingToRefund ? (
          <Badge.Ribbon
            text={t(last(toMiddleSplitNaming(RecordStatus[result]).split('-')) as string)}
            color="#00B2FF"
            className="flex items-center w-14 -top-5 -right-6 opacity-70 text-xs capitalize"
          >
            {content}
          </Badge.Ribbon>
        ) : (
          content
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
          value={searchAccount}
          onChange={(event) => {
            const value = event.target.value;

            if (value && !isAddress(value) && !isSS58Address(value)) {
              setIsValidSender(false);
              return;
            }

            try {
              setSearchAccount(value);
              setPaginator(paginatorDefault);
              setIsValidSender(true);
            } catch {
              setIsValidSender(false);
            }
          }}
          placeholder={t('Search by address')}
          className={`max-w-lg ${isValidSender ? '' : 'border-red-400'}`}
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
          label: t(label),
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
                    const paths = getDetailPaths(record);

                    if (paths.length) {
                      router.push({ pathname: `${Path.transaction}/${paths.join('/')}` });
                    } else {
                      message.error(`Can not find the detail page for ${record.fromChain} to ${record.toChain}`);
                    }
                  },
                })}
                pagination={{
                  pageSize: paginator.row,
                  total,
                  current: paginator.page + 1,
                  size: 'default',
                }}
                onChange={({ current, pageSize: size }, _filters, _sorter, extra) => {
                  const { action } = extra;

                  // @see https://github.com/ant-design/ant-design/issues/38240
                  if (action !== 'filter') {
                    setPaginator({ page: (current ?? 1) - 1, row: size ?? paginatorDefault.row });
                  }
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
