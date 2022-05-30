import { ArrowRightOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Button, Empty, Pagination, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { EthereumChainConfig, ICamelCaseKeys, PolkadotChainConfig } from 'shared/model';
import { fromWei, isKton, isRing, prettyNumber } from 'shared/utils/helper';
import { getDisplayName } from 'shared/utils/network';
import Web3 from 'web3';
import { HistoryItem } from '../../components/record/HistoryItem';
import { useITranslation } from '../../hooks';
import { Paginator } from '../../model';
import { useAccount, useApi } from '../../providers';
import { useRecords } from './hooks';
import { Ethereum2DarwiniaRedeemHistoryRes, Ethereum2DarwiniaRedeemRecord } from './model';

const PAGINATOR_DEFAULT = { row: 10, page: 0 };

function Record({
  record,
  departure,
  arrival,
}: {
  record: ICamelCaseKeys<Ethereum2DarwiniaRedeemRecord>;
  departure: EthereumChainConfig;
  arrival: PolkadotChainConfig;
}) {
  const { blockTimestamp, tx, darwiniaTx, currency, isRelayed, amount } = record;
  const [height, index] = darwiniaTx.split('-');
  const isRingTransfer = isRing(currency);
  const token = departure.tokens.find((item) => (isRingTransfer ? isRing(item.symbol) : isKton(item.symbol)))!;

  return (
    <HistoryItem
      key={blockTimestamp}
      record={{
        result: isRelayed && darwiniaTx ? 1 : 0,
        startTime: blockTimestamp,
      }}
      token={{
        ...token,
        amount: fromWei({ value: amount }, (value) => prettyNumber(value, { ignoreZeroDecimal: true })),
      }}
      process={
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Logo name={departure.logos[0].name} width={14} height={14} />
            <span>{getDisplayName(departure)}</span>

            <SubscanLink network={departure} txHash={tx}>
              <PaperClipOutlined className="hover:text-pangolin-main cursor-pointer" />
            </SubscanLink>
          </div>

          <ArrowRightOutlined />

          <div className="flex items-center gap-2">
            <Logo name={arrival.logos[0].name} width={14} height={14} />
            <span>{getDisplayName(arrival)}</span>
            <SubscanLink network={arrival} extrinsic={{ height, index }}>
              <PaperClipOutlined className="hover:text-pangolin-main cursor-pointer" />
            </SubscanLink>
          </div>
        </div>
      }
    ></HistoryItem>
  );
}

// eslint-disable-next-line complexity
export function Ethereum2DarwiniaHistory({
  confirmed,
  direction,
}: {
  confirmed: boolean | null;
  direction: [PolkadotChainConfig, EthereumChainConfig];
}) {
  const { t } = useITranslation();
  const { connectDepartureNetwork } = useApi();
  const { account } = useAccount();
  const { fetchRedeemRecords } = useRecords();
  const [loading, setLoading] = useState(false);
  const [paginator, setPaginator] = useState<Paginator>(PAGINATOR_DEFAULT);

  const [data, setData] = useState<Ethereum2DarwiniaRedeemHistoryRes<
    ICamelCaseKeys<Ethereum2DarwiniaRedeemRecord>
  > | null>(null);

  const [arrival, departure] = direction;

  useEffect(() => {
    if (!account || !Web3.utils.isAddress(account)) {
      setData(null);
      return;
    }

    fetchRedeemRecords({ address: account, direction: [arrival, departure], confirmed, paginator }).subscribe({
      next: (result) =>
        setData(result as Ethereum2DarwiniaRedeemHistoryRes<ICamelCaseKeys<Ethereum2DarwiniaRedeemRecord>>),
      error: () => setLoading(false),
      complete: () => setLoading(false),
    });
  }, [account, arrival, confirmed, departure, fetchRedeemRecords, paginator]);

  return (
    <Spin spinning={loading}>
      <div>
        {data?.list.length ? (
          data?.list.map((record) => (
            <Record key={record.blockTimestamp} record={record} departure={departure} arrival={arrival} />
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
            image={!data ? <Logo name="metamask.svg" width={96} height={96} /> : undefined}
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
