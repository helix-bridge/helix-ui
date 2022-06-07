import { ArrowRightOutlined, PaperClipOutlined } from '@ant-design/icons';
import { BN_ZERO } from '@polkadot/util';
import { Button, Empty, message, Pagination, Spin, Tag } from 'antd';
import BN from 'bn.js';
import { omit } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, filter, from, iif, map, Observable, of, switchMap, take, tap, zip } from 'rxjs';
import { Logo } from 'shared/components/widget/Logo';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { abi } from 'shared/config/abi';
import { ConnectionStatus, EthereumChainConfig, ICamelCaseKeys, PolkadotChainConfig } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { connect, entrance } from 'shared/utils/connection';
import { fromWei, isKton, isRing, isSS58Address, prettyNumber } from 'shared/utils/helper';
import { getDisplayName } from 'shared/utils/network';
import { HistoryItem } from '../../components/record/HistoryItem';
import { useITranslation } from '../../hooks';
import { Paginator } from '../../model';
import { useAccount, useApi, useTx } from '../../providers';
import { useRecords } from './hooks';
import { Darwinia2EthereumHistoryRes, Darwinia2EthereumRecord, EthereumDarwiniaBridgeConfig } from './model';
import { claimToken } from './utils';

function isSufficient(config: EthereumDarwiniaBridgeConfig, tokenAddress: string, amount: BN): Observable<boolean> {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const contract = new web3.eth.Contract(abi.tokenIssuingABI, config.contracts.redeem);
  const limit = from(contract.methods.dailyLimit(tokenAddress).call() as Promise<string>);
  const toadySpent = from(contract.methods.spentToday(tokenAddress).call() as Promise<string>);

  return zip([limit, toadySpent]).pipe(map(([total, spent]) => new BN(total).sub(new BN(spent)).gte(amount)));
}

const PAGINATOR_DEFAULT = { row: 10, page: 0 };

// eslint-disable-next-line complexity
export function Claim({
  confirmed,
  direction,
}: {
  confirmed: boolean | null;
  direction: [PolkadotChainConfig, EthereumChainConfig];
}) {
  const { t } = useTranslation();
  const { connectDepartureNetwork } = useApi();
  const { account } = useAccount();
  const { fetchIssuingRecords } = useRecords();
  const [loading, setLoading] = useState(false);
  const [paginator, setPaginator] = useState<Paginator>(PAGINATOR_DEFAULT);
  const [data, setData] = useState<Darwinia2EthereumHistoryRes<ICamelCaseKeys<Darwinia2EthereumRecord>> | null>(null);
  const [departure, arrival] = direction;

  useEffect(() => {
    if (!account || !isSS58Address(account)) {
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
              onChange={(page: number) => {
                setPaginator({ ...paginator, page: page - 1 });
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

// eslint-disable-next-line complexity
function Record({
  record,
  departure,
  arrival,
  meta,
}: {
  record: ICamelCaseKeys<Darwinia2EthereumRecord>;
  departure: PolkadotChainConfig;
  arrival: EthereumChainConfig;
  meta: Omit<Darwinia2EthereumHistoryRes, 'list' | 'count'>;
}) {
  const { blockTimestamp, signatures, ringValue, ktonValue, extrinsicIndex, tx } = record;
  const [height, index] = extrinsicIndex.split('-');
  const token =
    +ringValue > 0
      ? departure.tokens.find((item) => isRing(item.symbol))!
      : departure.tokens.find((item) => isKton(item.symbol))!;
  const { t } = useITranslation();
  const { observer, setTx } = useTx();
  const [hash, setHash] = useState(tx);
  const [isClaiming, setIsClaiming] = useState(false);

  const claim = useCallback(() => {
    const {
      signatures: sign,
      ringValue: ring,
      ktonValue: kton,
      mmrIndex,
      mmrRoot,
      blockHeader,
      blockNum,
      blockHash,
    } = record;
    setTx({ status: 'sending' });
    setIsClaiming(true);

    return connect(arrival!)
      .pipe(
        filter(({ status }) => status === ConnectionStatus.success),
        take(1),
        switchMap((_) => {
          const ringBN = new BN(ring);
          const ktonBN = new BN(kton);
          const bridge = getBridge<EthereumDarwiniaBridgeConfig>([departure!, arrival!]);
          const [{ address: ringAddress }, { address: ktonAddress }] = arrival.tokens; // FIXME: Token order on ethereum and ropsten must be 0 for ring, 1 for kton;
          const isRingSufficient = iif(
            () => ringBN.gt(BN_ZERO),
            isSufficient(bridge.config, ringAddress, ringBN),
            of(true)
          );
          const isKtonSufficient = iif(
            () => ktonBN.gt(BN_ZERO),
            isSufficient(bridge.config, ktonAddress, ktonBN),
            of(true)
          );

          return zip(isRingSufficient, isKtonSufficient);
        }),
        tap(([isRingSuf, isKtonSuf]) => {
          if (!isRingSuf) {
            message.warn(t('{{token}} daily limit reached!', { token: 'ring' }));
          }

          if (!isKtonSuf) {
            message.warn(t('{{token}} daily limit reached!', { token: 'kton' }));
          }
        }),
        switchMap(([isRingSuf, isKtonSuf]) =>
          isRingSuf && isKtonSuf
            ? claimToken({
                direction: { from: departure!, to: arrival! },
                mmrIndex,
                mmrRoot,
                mmrSignatures: sign,
                blockNumber: blockNum,
                blockHeaderStr: blockHeader,
                blockHash,
                meta,
              })
            : EMPTY
        )
      )
      .subscribe({
        ...observer,
        next: (state) => {
          if (state.status === 'finalized' && state.hash) {
            setHash(state.hash);
          }
          observer.next(state);
        },
        error: (err) => {
          observer.next({ status: 'error', error: err });
          setIsClaiming(false);
        },
        complete: () => {
          observer.complete();
          setIsClaiming(false);
        },
      });
  }, [arrival, departure, meta, observer, record, setTx, t]);

  return (
    <HistoryItem
      key={extrinsicIndex}
      record={{
        result: signatures && !hash ? 0 : 1,
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
            <SubscanLink network={arrival} txHash={hash}>
              <PaperClipOutlined className="hover:text-pangolin-main cursor-pointer" />
            </SubscanLink>
          </div>
        </div>
      }
    >
      <div className="flex items-center justify-center">
        {signatures && !hash ? (
          <Button disabled={isClaiming} onClick={claim}>
            {t('Claim')}
          </Button>
        ) : (
          <Tag color="success">{t('Claimed')}</Tag>
        )}
      </div>
    </HistoryItem>
  );
}
