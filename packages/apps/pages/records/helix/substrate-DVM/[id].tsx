import { isAfter } from 'date-fns';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { useMemo } from 'react';
import { SUBSTRATE_DVM_WITHDRAW } from 'shared/config/env';
import { HelixHistoryRecord } from 'shared/model';
import { revertAccount } from 'shared/utils/helper/address';
import { getBridge } from 'utils/bridge';
import { getOriginChainConfig } from 'utils/network';
import { getDirectionFromHelixRecord, getSentAmountFromHelixRecord, getTokenConfigFromHelixRecord } from 'utils/record';
import { SubstrateDVMBridgeConfig } from '../../../../bridges/helix/substrate-dvm/model';
import { Detail } from '../../../../components/transaction/Detail';
import { useUpdatableRecord } from '../../../../hooks';
import { TransferStep } from '../../../../model/transfer';
import { getServerSideRecordProps } from '../../../../utils/getServerSideRecordProps';

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  return getServerSideRecordProps(context);
}

const precompileDeprecatedAt = new Date('2022-08-15');

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

    const bridge = getBridge<SubstrateDVMBridgeConfig>(direction);
    const departure = getOriginChainConfig(record.fromChain);
    const arrival = getOriginChainConfig(record.toChain);
    const isIssuing = bridge.isIssue(departure, arrival);
    const fromToken = getTokenConfigFromHelixRecord(record);
    const toToken = getTokenConfigFromHelixRecord(record, 'recvToken');
    const amount = getSentAmountFromHelixRecord(record);

    let issuingTransfer: TransferStep[];
    let redeemTransfer: TransferStep[];

    if (departure.name.includes('darwinia') || isAfter(new Date(record.startTime * 1000), precompileDeprecatedAt)) {
      issuingTransfer = [
        {
          chain: departure,
          sender: revertAccount(record.sender, departure),
          recipient: revertAccount(record.recipient, arrival),
          token: fromToken,
          amount,
        },
      ];

      redeemTransfer = [
        {
          chain: departure,
          sender: revertAccount(record.sender, departure),
          recipient: revertAccount(record.recipient, arrival),
          token: fromToken,
          amount,
        },
      ];
    } else {
      const addr = toToken?.address ?? record.recvTokenAddress;

      issuingTransfer = [
        {
          chain: departure,
          sender: revertAccount(record.sender, departure),
          recipient: addr,
          token: fromToken,
          amount,
        },
        {
          chain: arrival,
          sender: addr,
          recipient: revertAccount(record.recipient, arrival),
          token: toToken,
          amount,
        },
      ];

      redeemTransfer = [
        {
          chain: departure,
          sender: revertAccount(record.sender, departure),
          recipient: SUBSTRATE_DVM_WITHDRAW,
          token: fromToken,
          amount,
        },
        {
          chain: arrival,
          sender: SUBSTRATE_DVM_WITHDRAW,
          recipient: revertAccount(record.recipient, arrival),
          token: toToken,
          amount,
        },
      ];
    }

    return isIssuing ? issuingTransfer : redeemTransfer;
  }, [record]);

  return record && <Detail record={record} transfers={transfers} />;
};

export default Page;
