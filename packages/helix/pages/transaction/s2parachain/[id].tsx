import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { GENESIS_ADDRESS, RecordStatus } from 'shared/config/constant';
import { SUBSTRATE_PARACHAIN_BACKING } from 'shared/config/env';
import { HelixHistoryRecord, Network, SubstrateSubstrateParachainBridgeConfig } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { revertAccount } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import { getReceivedAmountFromHelixRecord, getSentAmountFromHelixRecord } from 'shared/utils/record';
import { Detail } from '../../../components/transaction/Detail';
import { useUpdatableRecord } from '../../../hooks';
import { TransferStep } from '../../../model/transfer';
import { getServerSideRecordProps } from '../../../utils/getServerSideRecordProps';

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  return getServerSideRecordProps(context);
}

const Page: NextPage<{
  id: string;
}> = ({ id }) => {
  const router = useRouter();
  const { record } = useUpdatableRecord(id);

  // eslint-disable-next-line complexity
  const transfers = useMemo(() => {
    if (!record) {
      return [];
    }

    const departure = getChainConfig(router.query.from as Network);
    const arrival = getChainConfig(router.query.to as Network);
    const bridge = getBridge<SubstrateSubstrateParachainBridgeConfig>([departure, arrival]);
    const isIssuing = bridge.isIssuing(departure, arrival);
    const fromToken = departure.tokens.find((item) => item.symbol === record.sendToken)!;
    const toToken = arrival.tokens.find((item) => item.symbol === record.recvToken)!;
    const sendAmount = getSentAmountFromHelixRecord(record);
    const recvAmount = getReceivedAmountFromHelixRecord(record);

    const issueStart: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: SUBSTRATE_PARACHAIN_BACKING,
      token: fromToken,
      amount: sendAmount,
    };
    const issueSuccess: TransferStep = {
      chain: arrival,
      sender: GENESIS_ADDRESS,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
      amount: recvAmount,
    };
    const issueFail: TransferStep = {
      chain: arrival,
      sender: SUBSTRATE_PARACHAIN_BACKING,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
      amount: sendAmount,
    };

    const redeemStart: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: SUBSTRATE_PARACHAIN_BACKING,
      token: fromToken,
      amount: sendAmount,
    };
    const redeemDispatch: TransferStep = {
      chain: arrival,
      sender: SUBSTRATE_PARACHAIN_BACKING,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
      amount: recvAmount,
    };
    const redeemSuccess: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: GENESIS_ADDRESS,
      token: toToken,
      amount: recvAmount,
    };
    const redeemFail: TransferStep = {
      chain: departure,
      sender: SUBSTRATE_PARACHAIN_BACKING,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
      amount: sendAmount,
    };

    if (record.result === RecordStatus.pending) {
      return isIssuing ? [issueStart] : [redeemStart];
    }

    const issuingTransfer: TransferStep[] = [
      issueStart,
      record.result === RecordStatus.success ? issueSuccess : issueFail,
    ];

    const redeemTransfer: TransferStep[] =
      record.result === RecordStatus.success ? [redeemStart, redeemDispatch, redeemSuccess] : [redeemStart, redeemFail];

    return isIssuing ? issuingTransfer : redeemTransfer;
  }, [record, router.query.from, router.query.to]);

  return <Detail record={record} transfers={transfers} />;
};

export default Page;
