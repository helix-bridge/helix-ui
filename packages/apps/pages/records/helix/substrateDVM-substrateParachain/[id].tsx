import type { GetServerSidePropsContext, NextPage } from 'next';
import { useMemo } from 'react';
import { RecordStatus } from 'shared/config/constant';
import { HelixHistoryRecord } from 'shared/model';
import { revertAccount } from 'shared/utils/helper/address';
import { getBridge } from 'utils/bridge';
import {
  getDirectionFromHelixRecord,
  getReceivedAmountFromHelixRecord,
  getSentAmountFromHelixRecord,
} from 'utils/record';
import { CrabDVMDarwiniaDVMBridgeConfig } from '../../../../bridges/helix/crabDVM-darwiniaDVM/model';
import { DarwiniaDVMCrabDVMBridgeConfig } from '../../../../bridges/helix/darwiniaDVM-crabDVM/model';
import { Detail } from '../../../../components/transaction/Detail';
import { ZERO_ADDRESS } from '../../../../config';
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

    const direction = getDirectionFromHelixRecord(record);

    if (!direction) {
      return [];
    }

    const bridge = getBridge<DarwiniaDVMCrabDVMBridgeConfig | CrabDVMDarwiniaDVMBridgeConfig>(direction);
    const { from: fromToken, to: toToken } = direction;
    const departure = fromToken.meta;
    const arrival = toToken.meta;
    const isBack = bridge.isIssue(departure, arrival);
    const sendAmount = getSentAmountFromHelixRecord(record);
    const recvAmount = getReceivedAmountFromHelixRecord(record);
    const { backing } = bridge.config.contracts;
    const sender = revertAccount(record.sender, departure);
    const recipient = revertAccount(record.recipient, arrival);
    const issuing = ZERO_ADDRESS;

    const start: TransferStep = {
      chain: departure,
      sender,
      recipient: isBack ? backing : issuing,
      token: fromToken,
      amount: sendAmount,
    };

    const success: TransferStep = {
      chain: arrival,
      sender: isBack ? issuing : backing,
      recipient,
      token: toToken,
      amount: recvAmount,
    };

    const fail: TransferStep = {
      chain: departure,
      sender: isBack ? backing : issuing,
      recipient: sender,
      token: fromToken,
      amount: sendAmount,
    };

    if (record.result === RecordStatus.pending) {
      return [start];
    }

    return [start, record.result === RecordStatus.success ? success : fail];
  }, [record]);

  return record && <Detail record={record} transfers={transfers} />;
};

export default Page;
