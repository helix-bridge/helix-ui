import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { RecordStatus } from 'shared/config/constant';
import { CrabDVMHecoBridgeConfig, HelixHistoryRecord, Network } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { revertAccount } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import { Detail } from '../../../components/transaction/Detail';
import { TransferStep } from '../../../model/transfer';
import { getServerSideRecordProps } from '../../../utils/getServerSideRecordProps';

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  return getServerSideRecordProps(context);
}

const Page: NextPage<{
  id: string;
  data: HelixHistoryRecord;
}> = ({ data: record }) => {
  const router = useRouter();

  const transfers = useMemo(() => {
    const departure = getChainConfig(router.query.from as Network);
    const arrival = getChainConfig(router.query.to as Network);
    const bridge = getBridge<CrabDVMHecoBridgeConfig>([departure, arrival]);
    const isRedeem = bridge.isRedeem(departure, arrival);
    const fromToken = departure.tokens.find((item) => item.symbol.toLowerCase() === record.token.toLowerCase())!;

    const toToken = arrival.tokens.find((item) =>
      item.cross.find(
        (overview) => overview.partner.name === departure.name && overview.partner.symbol === fromToken.symbol
      )
    )!;

    let { issuing: originPool, redeem: targetPool } = bridge.config.contracts;

    if (isRedeem) {
      [originPool, targetPool] = [targetPool, originPool];
    }

    const start: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: originPool,
      token: fromToken,
    };

    const success: TransferStep = {
      chain: arrival,
      sender: targetPool,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
    };

    const refunded: TransferStep = {
      chain: departure,
      sender: originPool,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
    };

    const transfer = [start];

    if (record.result === RecordStatus.success) {
      transfer.push(success);
    } else if (record.result === RecordStatus.refunded) {
      transfer.push(refunded);
    }

    return transfer;
  }, [record.recipient, record.result, record.sender, record.token, router.query.from, router.query.to]);

  return <Detail record={record} transfers={transfers} />;
};

export default Page;
