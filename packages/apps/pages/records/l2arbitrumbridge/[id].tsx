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
import { EthereumArbitrumBridgeConfig } from '../../../bridges/l1tol2/ethereum-arbitrum/model';
import { Detail } from '../../../components/transaction/Detail';
import { ZERO_ADDRESS } from '../../../config';
import { useUpdatableRecord } from '../../../hooks';
import { TransferStep } from '../../../model/transfer';
import { getServerSideRecordProps } from '../../../utils/getServerSideRecordProps';

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

    const bridge = getBridge<EthereumArbitrumBridgeConfig>(direction);
    const isIssuing = bridge.isIssue(departure, arrival);
    const fromToken = getTokenConfigFromHelixRecord(record, 'sendToken');
    const toToken = getTokenConfigFromHelixRecord(record, 'recvToken');
    const sendAmount = getSentAmountFromHelixRecord(record);
    const recvAmount = getReceivedAmountFromHelixRecord(record);

    const { backing } = bridge.config.contracts;

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
      sender: ZERO_ADDRESS,
      recipient: revertAccount(record.sender, arrival),
      token: toToken,
      amount: recvAmount,
    };
    const issueFail: TransferStep = {
      chain: departure,
      sender: backing,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
      amount: '0',
    };

    // redeem steps
    const redeemStart: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: ZERO_ADDRESS,
      token: fromToken,
      amount: sendAmount,
    };
    const redeemSuccess: TransferStep = {
      chain: arrival,
      sender: backing,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
      amount: recvAmount,
    };
    const redeemFail: TransferStep = {
      chain: departure,
      sender: ZERO_ADDRESS,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
      amount: sendAmount,
    };

    if (record.result === RecordStatus.pending) {
      return isIssuing ? [issueStart] : [redeemStart];
    }

    const issuingTransfer = [issueStart, record.result === RecordStatus.success ? issueSuccess : issueFail];

    const redeemTransfer = [redeemStart, record.result === RecordStatus.success ? redeemSuccess : redeemFail];

    return isIssuing ? issuingTransfer : redeemTransfer;
  }, [record]);

  return record && <Detail record={record} transfers={transfers} />;
};

export default Page;
