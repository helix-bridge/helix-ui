import type { GetServerSidePropsContext, NextPage } from 'next';
import { useMemo } from 'react';
import { GENESIS_ADDRESS, RecordStatus } from 'shared/config/constant';
import { SUBSTRATE_PARACHAIN_BACKING } from 'shared/config/env';
import { HelixHistoryRecord } from 'shared/model';
import { revertAccount } from 'shared/utils/helper/address';
import { getBridge } from 'utils/bridge';
import { getChainConfig } from 'utils/network';
import {
  getDirectionFromHelixRecord,
  getReceivedAmountFromHelixRecord,
  getSentAmountFromHelixRecord,
  getTokenConfigFromHelixRecord,
} from 'utils/record';
import { SubstrateSubstrateParachainBridgeConfig } from '../../../../bridges/helix/substrate-substrateParachain/model';
import { Detail } from '../../../../components/transaction/Detail';
import { useUpdatableRecord } from '../../../../hooks';
import { TransferStep } from '../../../../model/transfer';
import { getServerSideRecordProps } from '../../../../utils/getServerSideRecordProps';

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  return getServerSideRecordProps(context);
}

const Page: NextPage<{
  id: string;
}> = ({ id }) => {
  const { record } = useUpdatableRecord(id);

  // eslint-disable-next-line complexity
  const transfers = useMemo(() => {
    if (!record) {
      return [];
    }

    const departure = getChainConfig(record.fromChain);
    const arrival = getChainConfig(record.toChain);
    const direction = getDirectionFromHelixRecord(record);

    if (!direction) {
      return [];
    }

    const bridge = getBridge<SubstrateSubstrateParachainBridgeConfig>(direction);
    const isIssuing = bridge.isIssue(departure, arrival);
    const fromToken = getTokenConfigFromHelixRecord(record);
    const toToken = getTokenConfigFromHelixRecord(record, 'recvToken');
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
  }, [record]);

  return record && <Detail record={record} transfers={transfers} />;
};

export default Page;
