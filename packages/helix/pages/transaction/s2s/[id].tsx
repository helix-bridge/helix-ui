import { Result } from 'antd';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { CrossChainStatus } from 'shared/config/constant';
import { useITranslation } from 'shared/hooks';
import { HelixHistoryRecord, Network, SubstrateSubstrateDVMBridgeConfig } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { revertAccount } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import { Detail } from '../../../components/transaction/Detail';
import { useUpdatableRecord } from '../../../hooks';
import { TransferStep } from '../../../model/transfer';
import { getServerSideRecordProps } from '../../../utils/getServerSideRecordProps';

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  return getServerSideRecordProps(context);
}

const Page: NextPage<{
  id: string;
  data: HelixHistoryRecord;
}> = ({ id, data }) => {
  const { t } = useITranslation();
  const router = useRouter();
  const { record } = useUpdatableRecord(data, id);

  // eslint-disable-next-line complexity
  const transfers = useMemo(() => {
    if (!record) {
      return null;
    }

    const departure = getChainConfig(router.query.from as Network);
    const arrival = getChainConfig(router.query.to as Network);
    const bridge = getBridge<SubstrateSubstrateDVMBridgeConfig>([departure, arrival]);
    const isIssuing = bridge.isIssuing(departure, arrival);
    const bridgeName = 'helix';

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

    // issuing steps
    const issueStart: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: issuingRecipient,
      token: fromToken,
    };
    const issueSuccess: TransferStep = {
      chain: arrival,
      sender: genesis,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
    };
    const issueFail: TransferStep = {
      chain: departure,
      sender: issuingRecipient,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
    };

    // redeem steps
    const redeemStart: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: redeemRecipient,
      token: fromToken,
    };
    const redeemDispatch: TransferStep = {
      chain: arrival,
      sender: issuingRecipient,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
    };
    const redeemSuccess: TransferStep = {
      chain: departure,
      sender: redeemRecipient,
      recipient: genesis,
      token: fromToken,
    };
    const redeemFail: TransferStep = {
      chain: departure,
      sender: redeemRecipient,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
    };

    if (record.result === CrossChainStatus.pending) {
      return isIssuing ? [issueStart] : [redeemFail];
    }

    const issuingTransfer =
      record.result === CrossChainStatus.success ? [issueStart, issueSuccess] : [issueStart, issueFail];

    const redeemTransfer =
      record.result === CrossChainStatus.success
        ? [redeemStart, redeemDispatch, redeemSuccess]
        : [redeemStart, redeemFail];

    return isIssuing ? issuingTransfer : redeemTransfer;
  }, [record, router.query.from, router.query.to]);

  return transfers ? (
    <Detail record={record} transfers={transfers} />
  ) : (
    <Result status="error" title={t('Record not found')} />
  );
};

export default Page;
