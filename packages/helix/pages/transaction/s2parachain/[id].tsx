import { Result } from 'antd';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { RecordStatus, GENESIS_ADDRESS } from 'shared/config/constant';
import { SUBSTRATE_PARACHAIN_BACKING } from 'shared/config/env';
import { useITranslation } from 'shared/hooks';
import { HelixHistoryRecord, Network, ParachainSubstrateBridgeConfig } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { revertAccount } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import { getTokenSymbolFromHelixRecord } from 'shared/utils/record';
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
    const bridge = getBridge<ParachainSubstrateBridgeConfig>([departure, arrival]);
    const isIssuing = bridge.isIssuing(departure, arrival);
    const symbol = getTokenSymbolFromHelixRecord(record);
    const fromToken = departure.tokens.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase())!;
    const toToken = arrival.tokens.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase())!;

    const issueStart: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: SUBSTRATE_PARACHAIN_BACKING,
      token: fromToken,
    };
    const issueSuccess: TransferStep = {
      chain: arrival,
      sender: GENESIS_ADDRESS,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
    };
    const issueFail: TransferStep = {
      chain: arrival,
      sender: SUBSTRATE_PARACHAIN_BACKING,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
    };

    const redeemStart: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: SUBSTRATE_PARACHAIN_BACKING,
      token: fromToken,
    };
    const redeemDispatch: TransferStep = {
      chain: arrival,
      sender: SUBSTRATE_PARACHAIN_BACKING,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
    };
    const redeemSuccess: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: GENESIS_ADDRESS,
      token: toToken,
    };
    const redeemFail: TransferStep = {
      chain: departure,
      sender: SUBSTRATE_PARACHAIN_BACKING,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
    };

    if (record.result === RecordStatus.pending) {
      return isIssuing ? [issueStart] : [redeemStart];
    }

    const issuingTransfer: TransferStep[] = [
      issueStart,
      record.result === RecordStatus.success ? issueSuccess : issueFail,
    ];

    const redeemTransfer: TransferStep[] =
      record.result === RecordStatus.success ? [redeemStart, redeemDispatch, redeemSuccess] : [redeemStart, redeemFail];

    return isIssuing ? issuingTransfer : redeemTransfer;
  }, [record, router.query.from, router.query.to]);

  return transfers ? (
    <Detail record={record} transfers={transfers} />
  ) : (
    <Result status="error" title={t('Record not found')} />
  );
};

export default Page;
