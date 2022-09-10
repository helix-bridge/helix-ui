import type { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { RecordStatus } from 'shared/config/constant';
import { HelixHistoryRecord, Network } from 'shared/model';
import { getBridge } from 'utils/bridge';
import { revertAccount } from 'shared/utils/helper/address';
import { getChainConfig } from 'utils/network';
import {
  getReceivedAmountFromHelixRecord,
  getSentAmountFromHelixRecord,
  getTokenConfigFromHelixRecord,
} from 'utils/record';
import { Detail } from '../../../components/transaction/Detail';
import { useUpdatableRecord } from '../../../hooks';
import { TransferStep } from '../../../model/transfer';
import { getServerSideRecordProps } from '../../../utils/getServerSideRecordProps';
import { CrabDVMHecoBridgeConfig } from '../../../bridges/celer/crabDVM-heco/model';

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  return getServerSideRecordProps(context);
}

const Page: NextPage<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const { record } = useUpdatableRecord(id);

  const transfers = useMemo(() => {
    if (!record) {
      return [];
    }

    const departure = getChainConfig(router.query.from as Network);
    const arrival = getChainConfig(router.query.to as Network);
    const bridge = getBridge<CrabDVMHecoBridgeConfig>([departure, arrival]);
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
  }, [record, router.query.from, router.query.to]);

  return <Detail record={record} transfers={transfers} />;
};

export default Page;
