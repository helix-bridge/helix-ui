import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { CrossChainStatus, GENESIS_ADDRESS } from 'shared/config/constant';
import { SUBSTRATE_PARACHAIN_BACKING } from 'shared/config/env';
import { HelixHistoryRecord, Network, ParachainSubstrateBridgeConfig } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { revertAccount } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import { Detail } from '../../../components/transaction/Detail';
import { useUpdatableRecord } from '../../../hooks';
import { getServerSideRecordProps } from '../../../utils/getServerSideRecordProps';

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  return getServerSideRecordProps(context);
}

const Page: NextPage<{
  id: string;
  data: HelixHistoryRecord;
}> = ({ id, data }) => {
  const router = useRouter();
  const { record } = useUpdatableRecord(data, id);
  const departure = getChainConfig(router.query.from as Network);
  const arrival = getChainConfig(router.query.to as Network);
  const bridge = getBridge<ParachainSubstrateBridgeConfig>([departure, arrival]);
  const isIssuing = bridge.isIssuing(departure, arrival);

  const transfers = useMemo(() => {
    const fromToken = departure.tokens.find((item) => item.symbol.toLowerCase() === record.token.toLowerCase())!;
    const toToken = arrival.tokens.find((item) => item.symbol.toLowerCase() === record.token.toLowerCase())!;

    const issuingTransfer =
      record.result === CrossChainStatus.success
        ? [
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: SUBSTRATE_PARACHAIN_BACKING,
              token: fromToken,
            },
            {
              chain: arrival,
              from: GENESIS_ADDRESS,
              to: revertAccount(record.recipient, arrival),
              token: toToken,
            },
          ]
        : [
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: SUBSTRATE_PARACHAIN_BACKING,
              token: fromToken,
            },
            {
              chain: arrival,
              from: SUBSTRATE_PARACHAIN_BACKING,
              to: revertAccount(record.sender, departure),
              token: fromToken,
            },
          ];

    const redeemTransfer =
      record.result === CrossChainStatus.success
        ? [
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: SUBSTRATE_PARACHAIN_BACKING,
              token: fromToken,
            },
            {
              chain: arrival,
              from: SUBSTRATE_PARACHAIN_BACKING,
              to: revertAccount(record.recipient, arrival),
              token: toToken,
            },
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: GENESIS_ADDRESS,
              token: toToken,
            },
          ]
        : [
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: SUBSTRATE_PARACHAIN_BACKING,
              token: fromToken,
            },
            {
              chain: departure,
              from: SUBSTRATE_PARACHAIN_BACKING,
              to: revertAccount(record.sender, departure),
              token: fromToken,
            },
          ];

    return isIssuing ? issuingTransfer : redeemTransfer;
  }, [arrival, departure, isIssuing, record.recipient, record.result, record.sender, record.token]);

  return <Detail record={record} transfers={transfers} />;
};

export default Page;
