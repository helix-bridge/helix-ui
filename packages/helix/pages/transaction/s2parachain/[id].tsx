import { Divider, Typography } from 'antd';
import { request } from 'graphql-request';
import { isEqual } from 'lodash';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { distinctUntilChanged, from as fromRx, map, of, switchMap } from 'rxjs';
import { CrossChainStatus, GENESIS_ADDRESS, MIDDLE_DURATION } from 'shared/config/constant';
import { ENDPOINT, SUBSTRATE_PARACHAIN_BACKING } from 'shared/config/env';
import { useIsMounted } from 'shared/hooks';
import { HelixHistoryRecord, Network, ParachainSubstrateBridgeConfig } from 'shared/model';
import { getBridge, isParachain2Substrate } from 'shared/utils/bridge';
import { fromWei, gqlName, pollWhile, prettyNumber, revertAccount } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import { IBreadcrumb } from '../../../components/transaction/Breadcrumb';
import { Bridge } from '../../../components/transaction/Bridge';
import { SourceTx } from '../../../components/transaction/SourceTx';
import { TargetTx } from '../../../components/transaction/TargetTx';
import { Timestamp } from '../../../components/transaction/Timestamp';
import { TransferDescription } from '../../../components/transaction/TransferDescription';
import { TransferDetail } from '../../../components/transaction/TransferDetail';
import { TxStatus } from '../../../components/transaction/TxStatus';
import { HISTORY_RECORD_BY_ID } from '../../../config';

const Page: NextPage<{
  id: string;
  data: HelixHistoryRecord;
}> = ({ id, data }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const isMounted = useIsMounted();
  const departure = getChainConfig(router.query.from as Network);
  const arrival = getChainConfig(router.query.to as Network);
  const bridge = getBridge<ParachainSubstrateBridgeConfig>([departure, arrival]);
  const isIssuing = bridge.isIssuing(departure, arrival);

  const [record, setRecord] = useState<HelixHistoryRecord>(data);

  const amount = useMemo(
    () =>
      fromWei(
        { value: record.amount, decimals: isParachain2Substrate(departure.name, arrival.name) ? 18 : 9 },
        prettyNumber
      ),
    [arrival, departure, record.amount]
  );

  const transfers = useMemo(() => {
    const fromToken = departure.tokens.find((item) => item.symbol.toLowerCase() === record.token.toLowerCase())!;
    const toToken = arrival.tokens.find((item) => item.symbol.toLowerCase() === record.token.toLowerCase())!;

    const issuingTransfer =
      record.result === CrossChainStatus.success
        ? [
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: SUBSTRATE_PARACHAIN_BACKING,
              token: fromToken,
            },
            {
              chain: arrival,
              from: GENESIS_ADDRESS,
              to: revertAccount(record.recipient, arrival),
              token: toToken,
            },
          ]
        : [
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: SUBSTRATE_PARACHAIN_BACKING,
              token: fromToken,
            },
            {
              chain: arrival,
              from: SUBSTRATE_PARACHAIN_BACKING,
              to: revertAccount(record.sender, departure),
              token: fromToken,
            },
          ];

    const redeemTransfer =
      record.result === CrossChainStatus.success
        ? [
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: SUBSTRATE_PARACHAIN_BACKING,
              token: fromToken,
            },
            {
              chain: arrival,
              from: SUBSTRATE_PARACHAIN_BACKING,
              to: revertAccount(record.recipient, arrival),
              token: toToken,
            },
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: GENESIS_ADDRESS,
              token: toToken,
            },
          ]
        : [
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: SUBSTRATE_PARACHAIN_BACKING,
              token: fromToken,
            },
            {
              chain: departure,
              from: SUBSTRATE_PARACHAIN_BACKING,
              to: revertAccount(record.sender, departure),
              token: fromToken,
            },
          ];

    return isIssuing ? issuingTransfer : redeemTransfer;
  }, [arrival, departure, isIssuing, record.recipient, record.result, record.sender, record.token]);

  useEffect(() => {
    if (record.result > CrossChainStatus.pending) {
      return;
    }

    const sub$$ = of(null)
      .pipe(
        switchMap(() => fromRx(request(ENDPOINT, HISTORY_RECORD_BY_ID, { id }))),
        map((res) => res[gqlName(HISTORY_RECORD_BY_ID)]),
        pollWhile<HelixHistoryRecord>(
          MIDDLE_DURATION,
          (res) => isMounted && res.result === CrossChainStatus.pending,
          100
        ),
        distinctUntilChanged((pre, cur) => isEqual(pre, cur))
      )
      .subscribe({
        next(result) {
          if (result) {
            setRecord(result);
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
      <IBreadcrumb txHash={record.requestTxHash} />

      <div className="flex justify-between items-center mt-6">
        <h3 className="uppercase text-xs md:text-lg">{t('transaction detail')}</h3>
        <Bridge />
      </div>

      <div className="px-8 py-3 mt-6 bg-gray-200 dark:bg-antDark">
        <SourceTx hash={record.requestTxHash} />

        <TargetTx record={record} />

        <TxStatus result={record.result} />

        <Timestamp departureRecord={record} arrivalRecord={record} />

        <Divider />

        <TransferDescription title={t('Sender')} tip={t('Address (external or contract) sending the transaction.')}>
          <Typography.Text copyable className="truncate">
            {revertAccount(record.sender, departure)}
          </Typography.Text>
        </TransferDescription>

        <TransferDescription title={t('Receiver')} tip={t('Address (external or contract) receiving the transaction.')}>
          <Typography.Text copyable className="truncate">
            {revertAccount(record.recipient, arrival)}
          </Typography.Text>
        </TransferDescription>

        {!!transfers.length && <TransferDetail transfers={transfers} amount={amount} />}

        <Divider />

        <TransferDescription
          title={t('Value')}
          tip={t('The amount to be transferred to the recipient with the cross-chain transaction.')}
        >
          {amount} {transfers[0].token.name}
        </TransferDescription>

        <TransferDescription
          title={t('Transaction Fee')}
          tip={'Amount paid for processing the cross-chain transaction.'}
        >
          {fromWei({ value: record.fee, decimals: isIssuing ? 9 : 18 })} {transfers[0].token.name}
        </TransferDescription>

        <Divider />

        <TransferDescription title={t('Nonce')} tip={t('A unique number of cross-chain transaction in Bridge')}>
          {record.nonce}
        </TransferDescription>
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  const translations = await serverSideTranslations(context.locale ?? 'en', ['common']);
  const { id } = context.params!;
  const result = await request(ENDPOINT, HISTORY_RECORD_BY_ID, { id });

  return {
    props: {
      ...translations,
      id,
      data: result[gqlName(HISTORY_RECORD_BY_ID)],
    },
  };
}

export default Page;
