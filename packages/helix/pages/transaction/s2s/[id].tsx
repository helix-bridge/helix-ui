import { Divider, Typography } from 'antd';
import { request } from 'graphql-request';
import { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from as fromRx, map } from 'rxjs';
import { CrossChainStatus, MIDDLE_DURATION } from 'shared/config/constant';
import { ENDPOINT } from 'shared/config/env';
import { useIsMounted } from 'shared/hooks';
import { HelixHistoryRecord, Network, NetworkQueryParams, SubstrateSubstrateDVMBridgeConfig } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { fromWei, gqlName, pollWhile, prettyNumber, revertAccount } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import { IBreadcrumb } from '../../../components/transaction/Breadcrumb';
import { Bridge } from '../../../components/transaction/Bridge';
import { SourceTx } from '../../../components/transaction/SourceTx';
import { FinalActionRecord, TargetTx } from '../../../components/transaction/TargetTx';
import { Timestamp } from '../../../components/transaction/Timestamp';
import { TransferDescription } from '../../../components/transaction/TransferDescription';
import { TransferDetail } from '../../../components/transaction/TransferDetail';
import { TxStatus } from '../../../components/transaction/TxStatus';
import {
  BURN_RECORD_QUERY,
  DVM_LOCK_RECORD_QUERY,
  S2S_ISSUING_RECORD_QUERY,
  SUBSTRATE_UNLOCKED_RECORD_QUERY,
} from '../../../config/gql';

const Page: NextPage<{
  id: string;
  issuingRecord: HelixHistoryRecord | null;
  redeemRecord: HelixHistoryRecord | null;
  lockOrUnlockRecord: FinalActionRecord | null;
  // eslint-disable-next-line complexity
}> = ({ id, issuingRecord, redeemRecord, lockOrUnlockRecord }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const isMounted = useIsMounted();

  const [departure, arrival] = useMemo(() => {
    const dep = router.query.from as Network;
    const arr = router.query.to as Network;

    return [getChainConfig(dep as Network), getChainConfig(arr as Network)];
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

    const query = isIssuing ? SUBSTRATE_UNLOCKED_RECORD_QUERY : DVM_LOCK_RECORD_QUERY;

    const sub$$ = fromRx(request(ENDPOINT, query, { id }))
      .pipe(map((res) => res[gqlName(query)]))
      .pipe(pollWhile(MIDDLE_DURATION, () => isMounted, 100))
      .subscribe({
        next(result) {
          if (result) {
            setFinalRecord(result);
          }
        },
        error(error: Error) {
          console.warn('🚨 ~ s2s detail polling exceed maximum limit  ', error.message);
        },
      });

    return () => sub$$?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <IBreadcrumb txHash={departureRecord?.requestTxHash ?? '-'} />

      <div className="flex justify-between items-center mt-6">
        <h3 className="uppercase text-xs md:text-lg">{t('transaction detail')}</h3>
        <Bridge />
      </div>

      <div className="px-8 py-3 mt-6 bg-gray-200 dark:bg-antDark">
        <SourceTx hash={departureRecord?.requestTxHash} />

        <TargetTx departureRecord={departureRecord} finalRecord={finalRecord} />

        <TxStatus result={departureRecord?.result} />

        <Timestamp departureRecord={departureRecord} arrivalRecord={arrivalRecord} />

        <Divider />

        <TransferDescription title={t('Sender')} tip={t('Address (external or contract) sending the transaction.')}>
          {departureRecord && (
            <Typography.Text copyable className="truncate">
              {revertAccount(departureRecord.sender, departure)}
            </Typography.Text>
          )}
        </TransferDescription>

        <TransferDescription title={t('Receiver')} tip={t('Address (external or contract) receiving the transaction.')}>
          {departureRecord && (
            <Typography.Text copyable className="truncate">
              {revertAccount(departureRecord.recipient, arrival)}
            </Typography.Text>
          )}
        </TransferDescription>

        {!!transfers.length && <TransferDetail transfers={transfers} amount={amount} />}

        <Divider />

        <TransferDescription
          title={t('Value')}
          tip={t('The amount to be transferred to the recipient with the cross-chain transaction.')}
        >
          {amount} {fromToken.name}
        </TransferDescription>

        <TransferDescription
          title={t('Transaction Fee')}
          tip={'Amount paid for processing the cross-chain transaction.'}
        >
          {fromWei({ value: departureRecord?.fee || arrivalRecord?.fee, decimals: isIssuing ? 9 : 18 })}{' '}
          {departure.tokens.find((item) => item.type === 'native')?.name}
        </TransferDescription>

        <Divider />

        <TransferDescription title={t('Nonce')} tip={t('A unique number of cross-chain transaction in Bridge')}>
          {departureRecord?.nonce}
        </TransferDescription>
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  const translations = await serverSideTranslations(context.locale ?? 'en', ['common']);
  const { id } = context.params!;
  const { from, to } = context.query as unknown as NetworkQueryParams;

  const vertices: [Network, Network] = [from, to];

  const bridge = getBridge(vertices);
  const isIssuing = bridge.isIssuing(...vertices);

  const issuing = request(ENDPOINT, S2S_ISSUING_RECORD_QUERY, { id });

  const unlocked = request(ENDPOINT, SUBSTRATE_UNLOCKED_RECORD_QUERY, { id }).then(
    (res) => res && res[gqlName(SUBSTRATE_UNLOCKED_RECORD_QUERY)]
  );

  const redeem = request(ENDPOINT, BURN_RECORD_QUERY, { id });

  const locked = request(ENDPOINT, DVM_LOCK_RECORD_QUERY, { id }).then(
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
