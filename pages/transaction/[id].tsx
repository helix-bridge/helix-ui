import { ClockCircleFilled, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Breadcrumb, Divider, Progress, Tooltip } from 'antd';
import BreadcrumbItem from 'antd/lib/breadcrumb/BreadcrumbItem';
import camelcaseKeys from 'camelcase-keys';
import { formatDistance, formatDistanceToNow, formatRFC7231 } from 'date-fns';
import { gql, request } from 'graphql-request';
import { has } from 'lodash';
import { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, from as fromRx, map, of, switchMap } from 'rxjs';
import { CrossChainState } from '../../components/widget/CrossChainStatus';
import { EllipsisMiddle } from '../../components/widget/EllipsisMiddle';
import { Logo } from '../../components/widget/Logo';
import { SubscanLink } from '../../components/widget/SubscanLink';
import { CrossChainStatus, MIDDLE_DURATION } from '../../config/constant';
import { useIsMounted } from '../../hooks';
import {
  Arrival,
  Departure,
  NetworkQueryParams,
  Substrate2SubstrateDVMRecord,
  Substrate2SubstrateRecord,
  SubstrateDVM2SubstrateRecord,
} from '../../model';
import { fromWei, getBridge, pollWhile, prettyNumber, revertAccount, verticesToChainConfig } from '../../utils';

/**
 * subgraph
 */
const S2S_REDEEM_RECORD_QUERY = gql`
  query burnRecordEntity($id: String!) {
    burnRecordEntity(id: $id) {
      amount
      end_timestamp
      lane_id
      nonce
      recipient
      request_transaction
      response_transaction
      result
      sender
      start_timestamp
      token
      fee
    }
  }
`;

/**
 * subql
 */
const S2S_ISSUING_RECORD_QUERY = gql`
  query s2sEvent($id: String!) {
    s2sEvent(id: $id) {
      amount
      endTimestamp
      id
      nonce
      recipient
      requestTxHash
      responseTxHash
      result
      senderId
      startTimestamp
      token
    }
  }
`;

const s2sDVMFields: [keyof Substrate2SubstrateDVMRecord, keyof Substrate2SubstrateRecord][] = [
  ['senderId', 'sender'],
  ['startTimestamp', 'startTime'],
  ['endTimestamp', 'endTime'],
];

const sDVM2sFields: [keyof SubstrateDVM2SubstrateRecord, keyof Substrate2SubstrateRecord][] = [
  ['end_timestamp', 'endTime'],
  ['start_timestamp', 'startTime'],
  ['request_transaction', 'requestTxHash'],
  ['response_transaction', 'responseTxHash'],
];

const unifyRecordField: (
  record: Record<string, unknown> | null,
  fieldsMap: [string, string][]
) => Record<string, string | number> | null = (data, fieldsMap) => {
  if (!data) {
    return null;
  }

  const renamed = fieldsMap.reduce((acc, cur) => {
    const [oKey, nKey] = cur;

    if (has(acc, oKey)) {
      acc[nKey] = acc[oKey];
    }

    return acc;
  }, data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const record = camelcaseKeys(renamed) as Record<string, any>;
  const reg = /^\d+$/;
  const bits = 13;

  record.startTime = reg.test(record.startTime) ? +record.startTime.padEnd(bits, '0') : record.startTime;
  record.endTime = reg.test(record.endTime) ? +record.endTime.padEnd(bits, '0') : record.endTime;

  return record;
};

const dataKey = (query: string) =>
  query
    .match(/\S\w+\(/g)
    ?.reverse()[0]
    .slice(0, -1) as string;

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
  // eslint-disable-next-line complexity
}> = ({ id, issuingRecord, redeemRecord }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const query = router.query as unknown as NetworkQueryParams;
  const isMounted = useIsMounted();

  const direction = useMemo(() => {
    const departure = {};
    const arrival = {};

    Object.entries(router.query).forEach(([key, value]) => {
      if (key.startsWith('from')) {
        Object.assign(departure, { [/from$/.test(key) ? 'network' : 'mode']: value });
      }
      if (key.startsWith('to')) {
        Object.assign(arrival, { [/to$/.test(key) ? 'network' : 'mode']: value });
      }
    });

    return [departure, arrival] as [Departure, Arrival];
  }, [router.query]);

  const [departure, arrival] = useMemo(() => direction.map((item) => verticesToChainConfig(item)), [direction]);

  const bridge = getBridge(direction);
  const isIssuing = bridge.isIssuing(...direction);

  const [departureRecord, arrRecord] = useMemo(
    () => (isIssuing ? [issuingRecord, redeemRecord] : [redeemRecord, issuingRecord]),
    [isIssuing, issuingRecord, redeemRecord]
  );

  const [arrivalRecord, setArrivalRecord] = useState<Substrate2SubstrateRecord | null>(arrRecord);

  const amount = useMemo(
    () => fromWei({ value: departureRecord?.amount ?? 0, unit: 'gwei' }, prettyNumber),
    [departureRecord?.amount]
  );

  /**
   * origin sender -> target recipient -> target sender -> origin recipient
   */
  const transfers = useMemo(() => {
    if (!departureRecord || !arrivalRecord) {
      return [];
    }

    return [
      {
        chain: departure,
        from: revertAccount(departureRecord.sender, query.from, query.fromMode),
        to: revertAccount(arrivalRecord.recipient, query.from, query.fromMode),
        token: { logo: '/image/ring.svg', name: isIssuing ? 'RING' : 'xRING' },
      },
      {
        chain: arrival,
        from: revertAccount(arrivalRecord.sender, query.to, query.toMode),
        to: revertAccount(departureRecord.recipient, query.to, query.toMode),
        token: { logo: '/image/ring.svg', name: isIssuing ? 'xRING' : 'RING' },
      },
    ];
  }, [
    arrival,
    arrivalRecord,
    departure,
    departureRecord,
    isIssuing,
    query.from,
    query.fromMode,
    query.to,
    query.toMode,
  ]);

  useEffect(() => {
    const iKey = dataKey(S2S_ISSUING_RECORD_QUERY);
    const rKey = dataKey(S2S_ISSUING_RECORD_QUERY);
    const apiConfig = bridge.config.api || {};

    if (departureRecord && arrivalRecord) {
      return;
    }

    const sub$$ = of(null)
      .pipe(
        switchMap(() => {
          if (!departureRecord) {
            return fromRx(request(apiConfig.subql + bridge.departure.name, S2S_ISSUING_RECORD_QUERY, { id })).pipe(
              map((res) => unifyRecordField(res[iKey], s2sDVMFields))
            );
          }

          if (!arrivalRecord) {
            return fromRx(request(apiConfig.subGraph, S2S_REDEEM_RECORD_QUERY, { id })).pipe(
              map((res) => unifyRecordField(res[rKey], sDVM2sFields))
            );
          }

          return EMPTY;
        }),
        pollWhile(MIDDLE_DURATION, () => isMounted)
      )
      .subscribe((result) => {
        if (result) {
          setArrivalRecord({ ...result, id } as Substrate2SubstrateRecord);
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
              className="flex items-center justify-center col-span-3 px-4 md:px-8 transform -translate-y-3 bg-gray-300 dark:bg-gray-900"
              style={{
                clipPath: 'polygon(85% 0%, 100% 50%, 85% 100%, 0% 100%, 15% 50%, 0% 0%)',
                height: 'calc(100% + 24px)',
              }}
            >
              <Image src={`/image/bridges/${bridge.category}.png`} width={77} height={21} className="w-10 md:w-20" />
            </div>
            <Logo chain={arrival} width={40} height={40} className="w-5 md:w-10" />
          </div>

          <div className="flex justify-between text-xs capitalize mt-1 px-3">
            <div style={{ width: 40 }}>{departure.name}</div>
            <div style={{ width: 40 }}>{arrival.name}</div>
          </div>
        </div>
      </div>

      <div className="px-8 py-3 mt-6 bg-gray-200 dark:bg-antDark">
        <Description title={t('Source Tx Hash')} tip={t('Address (external or contract) receiving the transaction.')}>
          {departureRecord && (
            <SubscanLink
              network={departure.name}
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
          {arrivalRecord ? (
            <SubscanLink
              network={arrival.name}
              txHash={arrivalRecord.requestTxHash}
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <EllipsisMiddle copyable>{arrivalRecord.requestTxHash}</EllipsisMiddle>
            </SubscanLink>
          ) : (
            <Progress percent={50} className="max-w-xs" />
          )}
        </Description>

        <Description
          title={t('Status')}
          tip={t('The status of the cross-chain transaction: Success, Pending, or Reverted.')}
        >
          <CrossChainState value={arrivalRecord?.result ?? CrossChainStatus.pending} />
        </Description>

        <Description
          title={t('Timestamp')}
          tip={t('Date & time of cross-chain transaction inclusion, including length of time for confirmation.')}
        >
          {departureRecord && (
            <div className="flex items-center gap-2">
              <ClockCircleOutlined />
              <span>
                {formatDistanceToNow(new Date(departureRecord.startTime), { includeSeconds: true, addSuffix: true })}
              </span>
              <span className="hidden md:inline-block">({formatRFC7231(new Date(departureRecord.startTime))})</span>
              <Divider type="vertical" orientation="center" />

              <ClockCircleFilled className="text-gray-400" />

              <span className="text-gray-400">
                {t('Confirmed within {{des}}', {
                  des: formatDistance(new Date(departureRecord.endTime), new Date(departureRecord.startTime), {
                    includeSeconds: true,
                  }),
                })}
              </span>
            </div>
          )}
        </Description>

        <Divider />

        <Description title={t('Sender')} tip={t('Address (external or contract) sending the transaction.')}>
          {departureRecord && (
            <EllipsisMiddle copyable>
              {revertAccount(departureRecord.sender, query.from, query.fromMode)}
            </EllipsisMiddle>
          )}
        </Description>

        <Description title={t('Receiver')} tip={t('Address (external or contract) receiving the transaction.')}>
          {departureRecord && (
            <EllipsisMiddle copyable>{revertAccount(departureRecord.recipient, query.to, query.toMode)}</EllipsisMiddle>
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
                  <Image src={token.logo} width={16} height={16} className="w-5" />
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
          {amount}
        </Description>

        <Description title={t('Transaction Fee')} tip={'Amount paid for processing the cross-chain transaction.'}>
          {fromWei({ value: departureRecord?.fee || arrivalRecord?.fee })}
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

  const bridge = getBridge([
    { network: from, mode: fromMode },
    { network: to, mode: toMode },
  ]);

  const apiConfig = bridge.config.api || {};
  const iKey = dataKey(S2S_ISSUING_RECORD_QUERY);
  const rKey = dataKey(S2S_REDEEM_RECORD_QUERY);
  const issuingRes = await request(apiConfig.subql + bridge.departure.name, S2S_ISSUING_RECORD_QUERY, { id });
  const redeemRes = await request(apiConfig.subGraph, S2S_REDEEM_RECORD_QUERY, { id });

  return {
    props: {
      ...translations,
      id,
      issuingRecord: unifyRecordField(issuingRes[iKey], s2sDVMFields),
      redeemRecord: unifyRecordField(redeemRes[rKey], sDVM2sFields),
    },
  };
}

export default Page;
