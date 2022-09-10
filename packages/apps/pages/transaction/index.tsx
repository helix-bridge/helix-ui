import { ClockCircleOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Input, message, Table, Tooltip } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import { formatDistance, fromUnixTime } from 'date-fns';
import format from 'date-fns-tz/format';
import { isAddress } from 'ethers/lib/utils';
import { useQuery } from 'graphql-hooks';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CrossChainState } from 'shared/components/widget/CrossChainStatus';
import { Logo } from 'shared/components/widget/Logo';
import { TextWithCopy } from 'shared/components/widget/TextWithCopy';
import { DATE_TIME_FORMAT } from 'shared/config/constant';
import { SYSTEM_CHAIN_CONFIGURATIONS } from 'shared/config/network';
import { HelixHistoryRecord, Network } from 'shared/model';
import { revertAccount, convertToDvm } from 'shared/utils/helper/address';
import { prettyNumber } from 'shared/utils/helper/balance';
import { gqlName } from 'shared/utils/helper/common';
import { isSS58Address, isValidAddress } from 'shared/utils/helper/validator';
import { getChainConfig, getDisplayName } from 'utils/network';
import { getFeeAmountFromHelixRecord, getSentAmountFromHelixRecord } from 'utils/record';
import { HISTORY_RECORDS, Path } from '../../config';
import { getDetailPaths } from '../../utils/record';

function RecordAccount({ chain, account }: { chain: Network; account: string }) {
  const chainConfig = getChainConfig(chain, SYSTEM_CHAIN_CONFIGURATIONS);
  const displayAccount = revertAccount(account, chainConfig);

  return (
    <div className="flex flex-col overflow-hidden" style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
      <span className="inline-flex items-center gap-2">
        <Logo name={chainConfig.logos[0].name} width={16} height={16} />
        <span className="capitalize">{getDisplayName(chainConfig)}</span>
      </span>

      <Tooltip title={<TextWithCopy>{displayAccount}</TextWithCopy>}>
        <span className="truncate">{displayAccount}</span>
      </Tooltip>
    </div>
  );
}

const PAGE_SIZE = 20;

// eslint-disable-next-line complexity
function Page() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isValidSender, setIsValidSender] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [account, setAccount] = useState<string | undefined>();
  const acc = account && isAddress(account) ? account.toLowerCase() : account;

  const {
    loading,
    data = { [gqlName(HISTORY_RECORDS)]: { total: 0, records: [] } },
    refetch,
  } = useQuery(HISTORY_RECORDS, {
    variables: {
      page: page - 1,
      row: pageSize,
      sender: acc,
      recipient: acc,
    },
  });
  const source = data[gqlName(HISTORY_RECORDS)];

  const columns: ColumnType<HelixHistoryRecord>[] = [
    {
      title: <span className="pl-4">{t('Time')}</span>,
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
          <span className="pl-4">
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
      width: '22%',
      ellipsis: true,
      render(chain: Network, record) {
        return <RecordAccount chain={chain} account={record.sender} />;
      },
    },
    {
      title: t('To'),
      dataIndex: 'toChain',
      width: '22%',
      ellipsis: true,
      render(chain: Network, record) {
        return <RecordAccount chain={chain} account={record.recipient} />;
      },
    },
    {
      title: t('Asset'),
      render(_: string, record) {
        const amount = getSentAmountFromHelixRecord(record);

        return (
          <Tooltip title={amount}>
            <span className="justify-self-center max-w-full truncate">
              {prettyNumber(amount, { decimal: 2, ignoreZeroDecimal: true })}
            </span>
            <span className="ml-2">{record.sendToken}</span>
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
      width: 70,
      render: (value) => (
        <span
          className={`justify-self-center ${
            /^[a-z]+[A-Z]{1}/.test(value) ? '' : /xcm/i.test(value) ? 'uppercase' : 'capitalize'
          }`}
        >
          {value.split('-')[0]}
        </span>
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

  return (
    <>
      <div className="mt-2 lg:mt-4 pb-2 lg:pb-4 flex justify-between items-end">
        <Input
          size="large"
          suffix={<SearchOutlined />}
          allowClear
          // eslint-disable-next-line complexity
          onChange={(event) => {
            const value = event.target.value;

            if (value && !isAddress(value) && !isSS58Address(value)) {
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
              refetch({ page: 0, row: pageSize, sender: account, recipient: account });
            } else {
              setPage(1);
            }
          }}
          disabled={loading}
          className="flex items-center cursor-pointer px-0"
        >
          <span className="mr-2">{t('Latest transactions')}</span>
          <SyncOutlined />
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={source?.records ?? []}
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
        pagination={{ pageSize, total: source?.total ?? 0, current: page, size: 'default' }}
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

export const getServerSideProps = async ({ locale, res }: GetServerSidePropsContext) => {
  const translations = await serverSideTranslations(locale ?? 'en', ['common']);
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=100');

  return {
    props: {
      ...translations,
    },
  };
};

export default Page;
