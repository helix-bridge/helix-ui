import { isAfter } from 'date-fns';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { SUBSTRATE_DVM_WITHDRAW } from 'shared/config/env';
import { HelixHistoryRecord, Network } from 'shared/model';
import { getBridge } from 'utils/bridge';
import { revertAccount } from 'shared/utils/helper/address';
import { getChainConfig } from 'utils/network';
import { getSentAmountFromHelixRecord, getTokenConfigFromHelixRecord } from 'utils/record';
import { Detail } from '../../../components/transaction/Detail';
import { useUpdatableRecord } from '../../../hooks';
import { TransferStep } from '../../../model/transfer';
import { getServerSideRecordProps } from '../../../utils/getServerSideRecordProps';
import { SubstrateDVMBridgeConfig } from '../../../bridges/helix/substrate-dvm/model';

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  return getServerSideRecordProps(context);
}

const precompileDeprecatedAt = new Date('2022-08-15');

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
    const bridge = getBridge<SubstrateDVMBridgeConfig>([departure, arrival]);
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
      issuingTransfer = [
        {
          chain: departure,
          sender: revertAccount(record.sender, departure),
          recipient: toToken.address,
          token: fromToken,
          amount,
        },
        {
          chain: arrival,
          sender: toToken.address,
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
  }, [record, router.query.from, router.query.to]);

  return <Detail record={record} transfers={transfers} />;
};

export default Page;
