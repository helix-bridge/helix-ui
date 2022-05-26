import { Divider } from 'antd';
import { gql, request } from 'graphql-request';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { EllipsisMiddle } from 'shared/components/widget/EllipsisMiddle';
import { WITHDRAW_ADDRESS } from 'shared/config/address';
import { HelixHistoryRecord, SubstrateDVMBridgeConfig } from 'shared/model';
import { getBridge, isDVM2Substrate } from 'shared/utils/bridge';
import { fromWei, gqlName, prettyNumber, revertAccount } from 'shared/utils/helper';
import { getChainConfig, toVertices } from 'shared/utils/network';
import { IBreadcrumb } from '../../../components/transaction/Breadcrumb';
import { Bridge } from '../../../components/transaction/Bridge';
import { SourceTx } from '../../../components/transaction/SourceTx';
import { TargetTx } from '../../../components/transaction/TargetTx';
import { Timestamp } from '../../../components/transaction/Timestamp';
import { TransferDescription } from '../../../components/transaction/TransferDescription';
import { TransferDetail } from '../../../components/transaction/TransferDetail';
import { TxStatus } from '../../../components/transaction/TxStatus';
import { endpoint } from '../../../config/endpoint';

const HISTORY_RECORD_BY_ID = gql`
  query historyRecordById($id: String!) {
    historyRecordById(id: $id) {
      id
      bridge
      fromChain
      toChain
      laneId
      nonce
      requestTxHash
      responseTxHash
      sender
      recipient
      token
      amount
      startTime
      endTime
      result
      fee
    }
  }
`;

const Page: NextPage<{
  id: string;
  record: HelixHistoryRecord;
}> = ({ record }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const departure = getChainConfig(toVertices(router.query.from as string));
  const arrival = getChainConfig(toVertices(router.query.to as string));
  const bridge = getBridge<SubstrateDVMBridgeConfig>([departure, arrival]);
  const isIssuing = bridge.isIssuing(departure, arrival);
  const amount = useMemo(
    () => fromWei({ value: record.amount, decimals: isDVM2Substrate(departure, arrival) ? 18 : 9 }, prettyNumber),
    [arrival, departure, record.amount]
  );

  const transfers = useMemo(() => {
    const fromToken = departure.tokens.find((item) => item.symbol.toLowerCase() === record.token.toLowerCase())!;
    const toToken = arrival.tokens.find((item) => item.symbol.toLowerCase() === record.token.toLowerCase())!;

    const issuingTransfer = [
      {
        chain: departure,
        from: revertAccount(record.sender, departure),
        to: toToken.address,
        token: fromToken,
      },
      {
        chain: arrival,
        from: toToken.address,
        to: revertAccount(record.recipient, arrival),
        token: toToken,
      },
    ];

    const redeemTransfer = [
      {
        chain: departure,
        from: revertAccount(record.sender, departure),
        to: WITHDRAW_ADDRESS,
        token: fromToken,
      },
      {
        chain: arrival,
        from: WITHDRAW_ADDRESS,
        to: revertAccount(record.recipient, arrival),
        token: toToken,
      },
    ];

    return isIssuing ? issuingTransfer : redeemTransfer;
  }, [arrival, departure, isIssuing, record.recipient, record.sender, record.token]);

  return (
    <>
      <IBreadcrumb txHash={record.requestTxHash} />

      <div className="flex justify-between items-center mt-6">
        <h3 className="uppercase text-xs md:text-lg">{t('transaction detail')}</h3>
        <Bridge />
      </div>

      <div className="px-8 py-3 mt-6 bg-gray-200 dark:bg-antDark">
        <SourceTx hash={record.requestTxHash} />

        <TargetTx finalRecord={{ ...record, txHash: record.responseTxHash! }} />

        <TxStatus result={record.result} />

        <Timestamp departureRecord={record} arrivalRecord={record} />

        <Divider />

        <TransferDescription title={t('Sender')} tip={t('Address (external or contract) sending the transaction.')}>
          <EllipsisMiddle copyable>{revertAccount(record.sender, departure)}</EllipsisMiddle>
        </TransferDescription>

        <TransferDescription title={t('Receiver')} tip={t('Address (external or contract) receiving the transaction.')}>
          <EllipsisMiddle copyable>{revertAccount(record.recipient, arrival)}</EllipsisMiddle>
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
  const result = await request(endpoint, HISTORY_RECORD_BY_ID, { id });

  return {
    props: {
      ...translations,
      id,
      record: result[gqlName(HISTORY_RECORD_BY_ID)],
    },
  };
}

export default Page;
