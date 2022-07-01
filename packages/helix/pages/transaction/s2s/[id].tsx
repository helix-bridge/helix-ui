import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { CrossChainStatus } from 'shared/config/constant';
import { HelixHistoryRecord, Network, SubstrateSubstrateDVMBridgeConfig } from 'shared/model';
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

  // eslint-disable-next-line complexity
  const transfers = useMemo(() => {
    if (!record || record.result === CrossChainStatus.pending) {
      return [];
    }

    const departure = getChainConfig(router.query.from as Network);
    const arrival = getChainConfig(router.query.to as Network);
    const bridge = getBridge<SubstrateSubstrateDVMBridgeConfig>([departure, arrival]);
    const isIssuing = bridge.isIssuing(departure, arrival);
    const bridgeName = 'helix';

    /**
     * TODO: find by token name
     *
     * @see https://github.com/helix-bridge/indexer/pull/40
     */
    const fromToken = departure.tokens.find(
      (token) =>
        token.type === (isIssuing ? 'native' : 'mapping') &&
        token.cross.map((item) => item.category).includes(bridgeName)
    )!;

    const toToken = arrival.tokens.find(
      (token) =>
        token.type === (isIssuing ? 'mapping' : 'native') &&
        token.cross.map((item) => item.category).includes(bridgeName)
    )!;

    const {
      contracts: { issuing: issuingRecipient, redeem: redeemRecipient, genesis },
    } = bridge.config;

    const issuingTransfer =
      record.result === CrossChainStatus.success
        ? [
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: issuingRecipient,
              token: fromToken,
            },
            {
              chain: arrival,
              from: genesis,
              to: revertAccount(record.recipient, arrival),
              token: toToken,
            },
          ]
        : [
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: issuingRecipient,
              token: fromToken,
            },
            {
              chain: departure,
              from: issuingRecipient,
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
              to: redeemRecipient,
              token: fromToken,
            },
            {
              chain: arrival,
              from: issuingRecipient,
              to: revertAccount(record.recipient, arrival),
              token: toToken,
            },
            {
              chain: departure,
              from: redeemRecipient,
              to: genesis,
              token: fromToken,
            },
          ]
        : [
            {
              chain: departure,
              from: revertAccount(record.sender, departure),
              to: redeemRecipient,
              token: fromToken,
            },
            {
              chain: departure,
              to: revertAccount(record.sender, departure),
              from: redeemRecipient,
              token: fromToken,
            },
          ];

    return isIssuing ? issuingTransfer : redeemTransfer;
  }, [record, router.query.from, router.query.to]);

  return <Detail record={record} transfers={transfers} />;
};

export default Page;
