import { ArrowRightOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Button, Empty, Pagination, Spin, Tooltip } from 'antd';
import { omit } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from 'shared/components/widget/Logo';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { CrossChainStatus } from 'shared/config/constant';
import { EthereumChainConfig, ICamelCaseKeys, PolkadotChainConfig } from 'shared/model';
import { fromWei, isKton, isRing, isSS58Address, prettyNumber } from 'shared/utils/helper';
import { getDisplayName } from 'shared/utils/network';
import { HistoryItem } from '../../components/record/HistoryItem';
import { useITranslation } from '../../hooks';
import { Paginator } from '../../model';
import { useAccount, useApi } from '../../providers';
import { useRecords } from './hooks';
import { Darwinia2EthereumHistoryRes, Darwinia2EthereumRecord } from './model';

const PAGINATOR_DEFAULT = { row: 10, page: 0 };

// eslint-disable-next-line complexity
function Record({
  record,
  departure,
  arrival,
}: {
  record: ICamelCaseKeys<Darwinia2EthereumRecord>;
  departure: PolkadotChainConfig;
  arrival: EthereumChainConfig;
  meta: Omit<Darwinia2EthereumHistoryRes, 'list' | 'count'>;
}) {
  const { t } = useITranslation();
  const { blockTimestamp, signatures, ringValue, ktonValue, extrinsicIndex, tx } = record;
  const [height, index] = extrinsicIndex.split('-');
  const token =
    +ringValue > 0
      ? departure.tokens.find((item) => isRing(item.symbol))!
      : departure.tokens.find((item) => isKton(item.symbol))!;
  const [hash] = useState(tx);
  const result = signatures && !hash ? 0 : 1;

  return (
    <HistoryItem
      key={extrinsicIndex}
      record={{
        result,
        startTime: blockTimestamp,
      }}
      token={{
        ...token,
        amount: fromWei({ value: +ringValue > 0 ? ringValue : ktonValue, decimals: 9 }, (value) =>
          prettyNumber(value, { ignoreZeroDecimal: true })
        ),
      }}
      process={
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Logo name={departure.logos[0].name} width={14} height={14} />
            <span>{getDisplayName(departure)}</span>

            <SubscanLink network={departure} extrinsic={{ height, index }}>
              <PaperClipOutlined className="hover:text-pangolin-main cursor-pointer" />
            </SubscanLink>
          </div>

          <ArrowRightOutlined />

          <div className="flex items-center gap-2">
            <Logo name={arrival.logos[0].name} width={14} height={14} />
            <span>{getDisplayName(arrival)}</span>
            {result !== CrossChainStatus.pending ? (
              <SubscanLink network={arrival} txHash={hash}>
                <PaperClipOutlined className="hover:text-pangolin-main cursor-pointer" />
              </SubscanLink>
            ) : (
              <Tooltip title={t('When the transaction is successful, the extrinsic message will be provided')}>
                <PaperClipOutlined className="cursor-pointer" />
              </Tooltip>
            )}
          </div>
        </div>
      }
    ></HistoryItem>
  );
}

// eslint-disable-next-line complexity
export function Darwinia2EthereumHistory({
  confirmed,
  direction,
}: {
  confirmed: boolean | null;
  direction: [PolkadotChainConfig, EthereumChainConfig];
}) {
  const { t } = useTranslation();
  const { account } = useAccount();
  const { fetchIssuingRecords } = useRecords();
  const [loading, setLoading] = useState(false);
  const [paginator, setPaginator] = useState<Paginator>(PAGINATOR_DEFAULT);
  const { connectDepartureNetwork } = useApi();
  const [data, setData] = useState<Darwinia2EthereumHistoryRes<ICamelCaseKeys<Darwinia2EthereumRecord>> | null>(null);
  const [departure, arrival] = direction;

  useEffect(() => {
    if (!account || !isSS58Address(account)) {
      setData(null);
      return;
    }

    fetchIssuingRecords({ address: account, confirmed, paginator }).subscribe({
      next: (result) => setData(result as Darwinia2EthereumHistoryRes<ICamelCaseKeys<Darwinia2EthereumRecord>>),
      error: () => setLoading(false),
      complete: () => setLoading(false),
    });
  }, [account, arrival, confirmed, departure, fetchIssuingRecords, paginator]);

  return (
    <Spin spinning={loading}>
      <div>
        {data?.list.length ? (
          data?.list.map((record) => (
            <Record
              key={record.extrinsicIndex}
              record={record}
              departure={departure}
              arrival={arrival}
              meta={omit(data, ['list', 'count'])}
            />
          ))
        ) : (
          <Empty
            description={
              !data ? (
                <Button onClick={() => connectDepartureNetwork(departure)}>{t('Connect to Wallet')}</Button>
              ) : (
                t('No Data')
              )
            }
            image={!data ? <Logo name="polkadot.svg" width={96} height={96} /> : undefined}
          />
        )}

        <div className="flex justify-end items-center">
          {!!data?.count && (
            <Pagination
              onChange={(page: number, pageSize: number) => {
                setPaginator({ row: pageSize, page: page - 1 });
              }}
              current={paginator.page + 1}
              pageSize={paginator.row}
              total={data.count ?? 0}
              showTotal={() => t('Total {{total}}', { total: data.count })}
            />
          )}
        </div>
      </div>
    </Spin>
  );
}
