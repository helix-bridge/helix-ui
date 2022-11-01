import type { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { RecordStatus } from 'shared/config/constant';
import { HelixHistoryRecord, Network } from 'shared/model';
import { revertAccount } from 'shared/utils/helper/address';
import { getChainConfig } from 'utils/network';
import {
  getReceivedAmountFromHelixRecord,
  getSentAmountFromHelixRecord,
  getTokenConfigFromHelixRecord,
} from 'utils/record';
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

  const transfers = useMemo(() => {
    if (!record) {
      return [];
    }

    const departure = getChainConfig(router.query.from as Network);
    const arrival = getChainConfig(router.query.to as Network);
    const fromToken = getTokenConfigFromHelixRecord(record);
    const toToken = getTokenConfigFromHelixRecord(record, 'recvToken');
    const sendAmount = getSentAmountFromHelixRecord(record);
    const recvAmount = getReceivedAmountFromHelixRecord(record);

    const start: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: ZERO_ADDRESS,
      token: fromToken,
      amount: sendAmount,
    };
    const success: TransferStep = {
      chain: arrival,
      sender: ZERO_ADDRESS,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
      amount: recvAmount,
    };
    const fail: TransferStep = {
      chain: arrival,
      sender: ZERO_ADDRESS,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
      amount: sendAmount,
    };

    if (record.result === RecordStatus.pending) {
      return [start];
    }

    return [start, record.result === RecordStatus.success ? success : fail];
  }, [record, router.query.from, router.query.to]);

  return record && <Detail record={record} transfers={transfers} />;
};

export default Page;
