import type { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { RecordStatus } from 'shared/config/constant';
import { HelixHistoryRecord, Network, SubstrateDVMSubstrateDVMBridgeConfig } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { revertAccount } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import {
  getReceivedAmountFromHelixRecord,
  getSentAmountFromHelixRecord,
  getTokenConfigFromHelixRecord,
} from 'shared/utils/record';
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
  const router = useRouter();
  const { record } = useUpdatableRecord(id);

  // eslint-disable-next-line complexity
  const transfers = useMemo(() => {
    if (!record) {
      return [];
    }

    const departure = getChainConfig(router.query.from as Network);
    const arrival = getChainConfig(router.query.to as Network);
    const bridge = getBridge<SubstrateDVMSubstrateDVMBridgeConfig>([departure, arrival]);
    const isIssuing = bridge.isIssue(departure, arrival);
    const fromToken = getTokenConfigFromHelixRecord(record);
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
      amount: sendAmount,
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
  }, [record, router.query.from, router.query.to]);

  return <Detail record={record} transfers={transfers} />;
};

export default Page;
