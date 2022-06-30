import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { SUBSTRATE_DVM_WITHDRAW } from 'shared/config/env';
import { HelixHistoryRecord, Network, SubstrateDVMBridgeConfig } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { revertAccount } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import { Detail } from '../../../components/transaction/Detail';
import { getServerSideRecordProps } from '../../../utils/getServerSideRecordProps';

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  return getServerSideRecordProps(context);
}

const Page: NextPage<{
  id: string;
  data: HelixHistoryRecord;
}> = ({ data: record }) => {
  const router = useRouter();
  const departure = getChainConfig(router.query.from as Network);
  const arrival = getChainConfig(router.query.to as Network);
  const bridge = getBridge<SubstrateDVMBridgeConfig>([departure, arrival]);
  const isIssuing = bridge.isIssuing(departure, arrival);

  const transfers = useMemo(() => {
    const fromToken = departure.tokens.find((item) => item.symbol.toLowerCase() === record.token.toLowerCase())!;
    const toToken = arrival.tokens.find((item) => item.symbol.toLowerCase() === record.token.toLowerCase())!;

    const issuingTransfer = [
      {
        chain: departure,
        from: revertAccount(record.sender, departure),
        to: toToken.address,
        token: fromToken,
      },
      {
        chain: arrival,
        from: toToken.address,
        to: revertAccount(record.recipient, arrival),
        token: toToken,
      },
    ];

    const redeemTransfer = [
      {
        chain: departure,
        from: revertAccount(record.sender, departure),
        to: SUBSTRATE_DVM_WITHDRAW,
        token: fromToken,
      },
      {
        chain: arrival,
        from: SUBSTRATE_DVM_WITHDRAW,
        to: revertAccount(record.recipient, arrival),
        token: toToken,
      },
    ];

    return isIssuing ? issuingTransfer : redeemTransfer;
  }, [arrival, departure, isIssuing, record.recipient, record.sender, record.token]);

  return <Detail record={record} transfers={transfers} />;
};

export default Page;
