import { Result } from 'antd';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { RecordStatus } from 'shared/config/constant';
import { PARACHAIN_PARACHAIN_BACKING, PARACHAIN_PARACHAIN_ISSUING } from 'shared/config/env';
import { CrabParachainKaruraParachainBridgeConfig, HelixHistoryRecord, Network } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { revertAccount } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import { useITranslation } from '../../../../apps/hooks';
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
  const { t } = useITranslation();
  const router = useRouter();

  const transfers = useMemo(() => {
    if (!record) {
      return null;
    }

    const departure = getChainConfig(router.query.from as Network);
    const arrival = getChainConfig(router.query.to as Network);
    const bridge = getBridge<CrabParachainKaruraParachainBridgeConfig>([departure, arrival]);
    const fromToken = departure.tokens.find((item) => item.symbol.toLowerCase() === record.sendToken.toLowerCase())!;
    const toToken = arrival.tokens.find((item) => item.symbol.toLowerCase() === record.sendToken.toLowerCase())!;
    const relayer = bridge.isIssuing(departure, arrival) ? PARACHAIN_PARACHAIN_BACKING : PARACHAIN_PARACHAIN_ISSUING;

    const start: TransferStep = {
      chain: departure,
      sender: revertAccount(record.sender, departure),
      recipient: relayer,
      token: fromToken,
    };
    const success: TransferStep = {
      chain: arrival,
      sender: relayer,
      recipient: revertAccount(record.recipient, arrival),
      token: toToken,
    };
    const fail: TransferStep = {
      chain: arrival,
      sender: relayer,
      recipient: revertAccount(record.sender, departure),
      token: fromToken,
    };

    if (record.result === RecordStatus.pending) {
      return [start];
    }

    return [start, record.result === RecordStatus.success ? success : fail];
  }, [record, router.query.from, router.query.to]);

  return transfers ? (
    <Detail record={record} transfers={transfers} />
  ) : (
    <Result status="error" title={t('Record not found')} />
  );
};

export default Page;
