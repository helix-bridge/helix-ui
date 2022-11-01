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
import { CrabDVMHecoBridgeConfig } from '../../../bridges/cbridge/crabDVM-heco/model';
import { Detail } from '../../../components/transaction/Detail';
import { useUpdatableRecord } from '../../../hooks';
import { TransferStep } from '../../../model/transfer';
import { getServerSideRecordProps } from '../../../utils/getServerSideRecordProps';

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  return getServerSideRecordProps(context);
}

const Page: NextPage<{ id: string }> = ({ id }) => {
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

    const bridge = getBridge<CrabDVMHecoBridgeConfig>(direction);
    const isRedeem = bridge.isRedeem(departure, arrival);
    const fromToken = getTokenConfigFromHelixRecord(record);
    const toToken = getTokenConfigFromHelixRecord(record, 'recvToken');
    const sendAmount = getSentAmountFromHelixRecord(record);
    const recvAmount = getReceivedAmountFromHelixRecord(record);

    let { backing: originPool, issuing: targetPool } = bridge.config.contracts;

    if (isRedeem) {
      [originPool, targetPool] = [targetPool, originPool];
    }

    const start: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: originPool,
      token: fromToken,
      amount: sendAmount,
    };

    const success: TransferStep = {
      chain: arrival,
      sender: targetPool,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
      amount: recvAmount,
    };

    const refunded: TransferStep = {
      chain: departure,
      sender: originPool,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
      amount: sendAmount,
    };

    const transfer = [start];

    if (record.result === RecordStatus.success) {
      transfer.push(success);
    } else if (record.result === RecordStatus.refunded) {
      transfer.push(refunded);
    }

    return transfer;
  }, [record]);

  return record && <Detail record={record} transfers={transfers} />;
};

export default Page;
