import { ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Breadcrumb, Divider, Progress, Tooltip } from 'antd';
import BreadcrumbItem from 'antd/lib/breadcrumb/BreadcrumbItem';
import { formatDistance, fromUnixTime } from 'date-fns';
import { gql, request } from 'graphql-request';
import { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from as fromRx, map, of, switchMap } from 'rxjs';
import { CrossChainState } from 'shared/components/widget/CrossChainStatus';
import { EllipsisMiddle } from 'shared/components/widget/EllipsisMiddle';
import { Icon } from 'shared/components/widget/Icon';
import { Logo } from 'shared/components/widget/Logo';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { CrossChainStatus, MIDDLE_DURATION } from 'shared/config/constant';
import { useIsMounted } from 'shared/hooks';
import {
  NetworkQueryParams,
  Substrate2SubstrateRecord,
  SubstrateSubstrateDVMBridgeConfig,
  UnlockedRecord,
  Vertices,
} from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { fromWei, gqlName, pollWhile, prettyNumber, revertAccount } from 'shared/utils/helper';
import { getChainConfig, getDisplayName } from 'shared/utils/network';
import { endpoint } from '../../config';

type FinalActionRecord = Pick<UnlockedRecord, 'txHash' | 'id' | 'recipient' | 'amount'>;

const BURN_RECORD_QUERY = gql`
  query burnRecord($id: ID!) {
    burnRecord(id: $id) {
      amount
      endTime
      laneId
      nonce
      recipient
      requestTxHash
      responseTxHash
      result
      sender
      startTime
      token
      fee
    }
  }
`;

const DVM_LOCK_RECORD_QUERY = gql`
  query dvmLockRecord($id: ID!) {
    dvmLockRecord(id: $id) {
      id
      laneId
      nonce
      recipient
      txHash
      amount
      token
    }
  }
`;

const S2S_ISSUING_RECORD_QUERY = gql`
  query lockRecord($id: ID!) {
    lockRecord(id: $id) {
      id
      amount
      endTime
      nonce
      recipient
      requestTxHash
      responseTxHash
      result
      sender
      startTime
      token
      fee
    }
  }
`;

const SUBSTRATE_UNLOCKED_RECORD_QUERY = gql`
  query unlockRecord($id: ID!) {
    unlockRecord(id: $id) {
      id
      recipient
      token
      amount
      timestamp
      txHash
      block
    }
  }
`;

function Description({ tip, title, children }: PropsWithChildren<{ tip: string; title: string }>) {
  return (
    <div className="flex flex-wrap md:items-center gap-2 md:gap-16 my-3 md:my-6">
      <div className="w-36 flex items-center gap-2">
        <Tooltip title={tip} className="cursor-help">
          <InfoCircleOutlined />
        </Tooltip>
        <span className="capitalize">{title}</span>
      </div>

      {children}
    </div>
  );
}

const Page: NextPage<{
  id: string;
  issuingRecord: Substrate2SubstrateRecord | null;
  redeemRecord: Substrate2SubstrateRecord | null;
  lockOrUnlockRecord: FinalActionRecord | null;
  // eslint-disable-next-line complexity
}> = ({ id, issuingRecord, redeemRecord, lockOrUnlockRecord }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const query = router.query as unknown as NetworkQueryParams;
  const isMounted = useIsMounted();

  const [departure, arrival] = useMemo(() => {
    const dep = {};
    const arr = {};

    Object.entries(router.query).forEach(([key, value]) => {
      if (key.startsWith('from')) {
        Object.assign(dep, { [/from$/.test(key) ? 'network' : 'mode']: value });
      }
      if (key.startsWith('to')) {
        Object.assign(arr, { [/to$/.test(key) ? 'network' : 'mode']: value });
      }
    });

    return [getChainConfig(dep as Vertices), getChainConfig(arr as Vertices)];
  }, [router.query]);

  const bridge = getBridge<SubstrateSubstrateDVMBridgeConfig>([departure, arrival]);
  const isIssuing = bridge.isIssuing(departure, arrival);

  const [departureRecord, arrivalRecord] = useMemo(
    () => (isIssuing ? [issuingRecord, redeemRecord] : [redeemRecord, issuingRecord]),
    [isIssuing, issuingRecord, redeemRecord]
  );

  const [fromToken, toToken] = useMemo(() => {
    const bridgeName = 'helix';

    return [
      departure.tokens.find(
        (token) =>
          token.type === (isIssuing ? 'native' : 'mapping') &&
          token.cross.map((item) => item.category).includes(bridgeName)
      )!,
      arrival.tokens.find(
        (token) =>
          token.type === (isIssuing ? 'mapping' : 'native') &&
          token.cross.map((item) => item.category).includes(bridgeName)
      )!,
    ];
  }, [arrival.tokens, departure.tokens, isIssuing]);

  const [finalRecord, setFinalRecord] = useState<FinalActionRecord | null>(lockOrUnlockRecord);

  const amount = useMemo(
    () => fromWei({ value: departureRecord?.amount ?? 0, decimals: 9 }, prettyNumber),
    [departureRecord?.amount]
  );

  // eslint-disable-next-line complexity
  const transfers = useMemo(() => {
    if (!departureRecord || departureRecord?.result === CrossChainStatus.pending) {
      return [];
    }

    const {
      contracts: { issuing: issuingRecipient, redeem: redeemRecipient, genesis },
    } = bridge.config;

    const issuingTransfer =
      departureRecord.result === CrossChainStatus.success
        ? [
            {
              chain: departure,
              from: revertAccount(departureRecord.sender, departure),
              to: issuingRecipient,
              token: fromToken,
            },
            {
              chain: arrival,
              from: genesis,
              to: revertAccount(departureRecord.recipient, arrival),
              token: toToken,
            },
          ]
        : [
            {
              chain: departure,
              from: revertAccount(departureRecord.sender, departure),
              to: issuingRecipient,
              token: fromToken,
            },
            {
              chain: departure,
              from: issuingRecipient,
              to: revertAccount(departureRecord.sender, departure),
              token: fromToken,
            },
          ];

    const redeemTransfer =
      departureRecord.result === CrossChainStatus.success
        ? [
            {
              chain: departure,
              from: revertAccount(departureRecord.sender, departure),
              to: redeemRecipient,
              token: fromToken,
            },
            {
              chain: arrival,
              from: issuingRecipient,
              to: revertAccount(departureRecord.recipient, arrival),
              token: toToken,
            },
            {
              chain: departure,
              from: redeemRecipient,
              to: genesis,
              token: fromToken,
            },
          ]
        : [
            {
              chain: departure,
              from: revertAccount(departureRecord.sender, departure),
              to: redeemRecipient,
              token: fromToken,
            },
            {
              chain: departure,
              to: revertAccount(departureRecord.sender, departure),
              from: redeemRecipient,
              token: fromToken,
            },
          ];

    return isIssuing ? issuingTransfer : redeemTransfer;
  }, [arrival, bridge.config, departure, departureRecord, fromToken, isIssuing, toToken]);

  useEffect(() => {
    if (finalRecord) {
      return;
    }

    const sub$$ = of(null)
      .pipe(
        switchMap(() => {
          const unlockObs = fromRx(request(endpoint, SUBSTRATE_UNLOCKED_RECORD_QUERY, { id })).pipe(
            map((res) => res[gqlName(SUBSTRATE_UNLOCKED_RECORD_QUERY)])
          );

          const lockObs = fromRx(request(endpoint, DVM_LOCK_RECORD_QUERY, { id })).pipe(
            map((res) => res[gqlName(DVM_LOCK_RECORD_QUERY)])
          );

          return isIssuing ? lockObs : unlockObs;
        }),
        pollWhile(MIDDLE_DURATION, () => isMounted)
      )
      .subscribe((result) => {
        if (result) {
          setFinalRecord(result);
        }
      });

    return () => sub$$?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Breadcrumb className="whitespace-nowrap flex items-center overflow-hidden overflow-ellipsis">
        <BreadcrumbItem>{t('Explorer')}</BreadcrumbItem>
        <BreadcrumbItem>{t('Transaction')}</BreadcrumbItem>
        <BreadcrumbItem>
          <EllipsisMiddle className="w-32 md:w-72 lg:w-96">{departureRecord?.requestTxHash}</EllipsisMiddle>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex justify-between items-center mt-6">
        <h3 className="uppercase text-xs md:text-lg">{t('transaction detail')}</h3>

        <div>
          <div
            className="grid grid-cols-5 gap-4 p-3 bg-gray-200 dark:bg-antDark bg-opacity-25"
            style={{ borderRadius: 40 }}
          >
            <Logo chain={departure} width={40} height={40} className="w-5 md:w-10" />
            <div
              className="flex items-center justify-center col-span-3 px-4 md:px-8 transform -translate-y-3 bg-gray-300 bg-opacity-20 dark:bg-blue-900 dark:bg-opacity-25"
              style={{
                clipPath: 'polygon(85% 0%, 100% 50%, 85% 100%, 0% 100%, 15% 50%, 0% 0%)',
                height: 'calc(100% + 24px)',
              }}
            >
              <Image src={`/image/bridges/${bridge.category}.png`} width={77} height={21} className="w-10 md:w-20" />
            </div>
            <Logo chain={arrival} width={40} height={40} className="w-5 md:w-10" />
          </div>

          <div className="flex justify-between text-xs capitalize mt-1 px-3 whitespace-nowrap">
            {[departure, arrival].map((item) => (
              <div key={item.name}>{getDisplayName(item)}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 py-3 mt-6 bg-gray-200 dark:bg-antDark">
        <Description
          title={t('Source Tx Hash')}
          tip={t('Unique character string (TxID) assigned to every verified transaction on the Source Chain.')}
        >
          {departureRecord && (
            <SubscanLink
              network={departure}
              txHash={departureRecord.requestTxHash}
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <EllipsisMiddle copyable>{departureRecord.requestTxHash}</EllipsisMiddle>
            </SubscanLink>
          )}
        </Description>

        <Description
          title={t('Target Tx Hash')}
          tip={t('Unique character string (TxID) assigned to every verified transaction on the Target Chain.')}
        >
          {finalRecord ? (
            <SubscanLink
              network={arrival}
              txHash={finalRecord?.txHash}
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <EllipsisMiddle copyable>{finalRecord.txHash}</EllipsisMiddle>
            </SubscanLink>
          ) : departureRecord?.result === CrossChainStatus.reverted ? (
            <SubscanLink
              network={departure}
              txHash={departureRecord?.responseTxHash ?? ''}
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <EllipsisMiddle copyable>{departureRecord.responseTxHash}</EllipsisMiddle>
            </SubscanLink>
          ) : (
            <Progress percent={50} className="max-w-xs" />
          )}
        </Description>

        <Description
          title={t('Status')}
          tip={t('The status of the cross-chain transaction: Success, Pending, or Reverted.')}
        >
          <CrossChainState value={departureRecord?.result ?? CrossChainStatus.pending} />
        </Description>

        <Description
          title={t('Timestamp')}
          tip={t('Date & time of cross-chain transaction inclusion, including length of time for confirmation.')}
        >
          {departureRecord && (
            <div className="flex items-center gap-2 whitespace-nowrap">
              {arrivalRecord?.result ? <ClockCircleOutlined /> : <Icon name="reload" />}

              <span>
                {formatDistance(fromUnixTime(departureRecord.startTime), new Date(new Date().toUTCString()), {
                  includeSeconds: true,
                  addSuffix: true,
                })}
              </span>

              <span className="hidden md:inline-block">
                ({new Date(departureRecord.startTime * 1000).toLocaleString()})
              </span>

              <Divider type="vertical" orientation="center" />

              <Icon name="clock-fill" className="text-gray-400 text-base" />

              {departureRecord.startTime && departureRecord.endTime ? (
                <span className="text-gray-400">
                  {t('Confirmed within {{des}}', {
                    des: formatDistance(
                      fromUnixTime(departureRecord.endTime),
                      fromUnixTime(departureRecord.startTime),
                      {
                        includeSeconds: true,
                      }
                    ),
                  })}
                </span>
              ) : (
                <div className="w-32">
                  <Progress
                    strokeColor={{
                      from: '#108ee9',
                      to: '#87d068',
                    }}
                    percent={99.9}
                    status="active"
                    showInfo={false}
                  />
                </div>
              )}
            </div>
          )}
        </Description>

        <Divider />

        <Description title={t('Sender')} tip={t('Address (external or contract) sending the transaction.')}>
          {departureRecord && (
            <EllipsisMiddle copyable>
              {revertAccount(departureRecord.sender, { name: query.from, mode: query.fromMode })}
            </EllipsisMiddle>
          )}
        </Description>

        <Description title={t('Receiver')} tip={t('Address (external or contract) receiving the transaction.')}>
          {departureRecord && (
            <EllipsisMiddle copyable>
              {revertAccount(departureRecord.recipient, { name: query.to, mode: query.toMode })}
            </EllipsisMiddle>
          )}
        </Description>

        {!!transfers.length && (
          <Description
            title={t('Token Transfer')}
            tip={t('List of tokens transferred in this cross-chain transaction.')}
          >
            <div className="flex flex-col gap-2">
              {transfers.map(({ chain, from, to, token }) => (
                <div key={token.name} className="flex items-center gap-2">
                  <Logo chain={chain} width={16} height={16} className="w-5" />
                  <span>{t('From')}</span>
                  <span className="w-32 text-center">
                    <EllipsisMiddle>{from}</EllipsisMiddle>
                  </span>
                  <span>{t('To')}</span>
                  <span className="w-32 text-center">
                    <EllipsisMiddle>{to}</EllipsisMiddle>
                  </span>
                  <span>{t('For')}</span>
                  <Image src={`/image/${token.logo}`} width={16} height={16} className="w-5" />
                  <span>
                    {amount} {token.name}
                  </span>
                </div>
              ))}
            </div>
          </Description>
        )}

        <Divider />

        <Description
          title={t('Value')}
          tip={t('The amount to be transferred to the recipient with the cross-chain transaction.')}
        >
          {amount} {fromToken.name}
        </Description>

        <Description title={t('Transaction Fee')} tip={'Amount paid for processing the cross-chain transaction.'}>
          {fromWei({ value: departureRecord?.fee || arrivalRecord?.fee, decimals: isIssuing ? 9 : 18 })}{' '}
          {departure.tokens.find((item) => item.type === 'native')?.name}
        </Description>

        <Divider />

        <Description title={t('Nonce')} tip={t('A unique number of cross-chain transaction in Bridge')}>
          {departureRecord?.nonce}
        </Description>
      </div>
    </>
  );
};

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }, Substrate2SubstrateRecord>
) {
  const translations = await serverSideTranslations(context.locale ?? 'en', ['common']);
  const { id } = context.params!;
  const { from, fromMode, to, toMode } = context.query as unknown as NetworkQueryParams;

  const vertices: [Vertices, Vertices] = [
    { name: from, mode: fromMode },
    { name: to, mode: toMode },
  ];

  const bridge = getBridge(vertices);
  const isIssuing = bridge.isIssuing(...vertices);

  const issuing = request(endpoint, S2S_ISSUING_RECORD_QUERY, { id });

  const unlocked = request(endpoint, SUBSTRATE_UNLOCKED_RECORD_QUERY, { id }).then(
    (res) => res && res[gqlName(SUBSTRATE_UNLOCKED_RECORD_QUERY)]
  );

  const redeem = request(endpoint, BURN_RECORD_QUERY, { id });

  const locked = request(endpoint, DVM_LOCK_RECORD_QUERY, { id }).then(
    (res) => res && res[gqlName(DVM_LOCK_RECORD_QUERY)]
  );

  const [issuingRes, redeemRes, lockOrUnlockRecord] = await Promise.all([
    issuing,
    redeem,
    isIssuing ? locked : unlocked,
  ]);

  return {
    props: {
      ...translations,
      id,
      issuingRecord: issuingRes[gqlName(S2S_ISSUING_RECORD_QUERY)],
      redeemRecord: redeemRes[gqlName(BURN_RECORD_QUERY)],
      lockOrUnlockRecord,
    },
  };
}

export default Page;
