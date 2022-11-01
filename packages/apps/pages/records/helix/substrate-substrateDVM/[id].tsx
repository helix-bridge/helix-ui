import type { GetServerSidePropsContext, NextPage } from 'next';
import { useMemo } from 'react';
import { RecordStatus } from 'shared/config/constant';
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
import { SubstrateSubstrateDVMBridgeConfig } from '../../../../bridges/helix/substrate-substrateDVM/model';
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

    const bridge = getBridge<SubstrateSubstrateDVMBridgeConfig>(direction);
    const isIssuing = bridge.isIssue(departure, arrival);
    const fromToken = getTokenConfigFromHelixRecord(record);
    const toToken = getTokenConfigFromHelixRecord(record, 'recvToken');
    const sendAmount = getSentAmountFromHelixRecord(record);
    const recvAmount = getReceivedAmountFromHelixRecord(record);

    const { backing, issuing, genesis } = bridge.config.contracts;

    // issuing steps
    const issueStart: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: backing,
      token: fromToken,
      amount: sendAmount,
    };
    const issueSuccess: TransferStep = {
      chain: arrival,
      sender: genesis,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
      amount: recvAmount,
    };
    const issueFail: TransferStep = {
      chain: departure,
      sender: backing,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
      amount: sendAmount,
    };

    // redeem steps
    const redeemStart: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: issuing,
      token: fromToken,
      amount: sendAmount,
    };
    const redeemDispatch: TransferStep = {
      chain: arrival,
      sender: backing,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
      amount: recvAmount,
    };
    const redeemSuccess: TransferStep = {
      chain: departure,
      sender: issuing,
      recipient: genesis,
      token: fromToken,
      amount: recvAmount,
    };
    const redeemFail: TransferStep = {
      chain: departure,
      sender: issuing,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
      amount: sendAmount,
    };

    if (record.result === RecordStatus.pending) {
      return isIssuing ? [issueStart] : [redeemStart];
    }

    const issuingTransfer =
      record.result === RecordStatus.success ? [issueStart, issueSuccess] : [issueStart, issueFail];

    const redeemTransfer =
      record.result === RecordStatus.success ? [redeemStart, redeemDispatch, redeemSuccess] : [redeemStart, redeemFail];

    return isIssuing ? issuingTransfer : redeemTransfer;
  }, [record]);

  return record && <Detail record={record} transfers={transfers} />;
};

export default Page;
