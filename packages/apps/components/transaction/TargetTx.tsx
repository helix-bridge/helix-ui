import { Progress } from 'antd';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { ExplorerLink } from 'shared/components/widget/ExplorerLink';
import { TextWithCopy } from 'shared/components/widget/TextWithCopy';
import { RecordStatus } from 'shared/config/constant';
import { HelixHistoryRecord, Network } from 'shared/model';
import { isCBridgeRecord, isHelixRecord, isXCMRecord } from 'shared/utils/record';
import { TransferDescription } from './TransferDescription';

interface HashProps {
  hash: string;
  network: Network;
}

const Hash = ({ hash, network }: HashProps) => {
  const txHash = hash.includes('-') ? undefined : hash;
  const extrinsic = hash.includes('-') ? hash.split('-') : undefined;

  return (
    <ExplorerLink
      network={network}
      txHash={txHash}
      extrinsic={extrinsic && { height: extrinsic[0], index: extrinsic[1] }}
      className="hover:opacity-80 transition-opacity duration-200"
    >
      <TextWithCopy underline>{hash}</TextWithCopy>
    </ExplorerLink>
  );
};

export function TargetTx({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useTranslation();
  const router = useRouter();
  const departure = router.query.from as Network;
  const arrival = router.query.to as Network;

  // eslint-disable-next-line complexity
  const content = useMemo(() => {
    if (!record) {
      return null;
    }

    if ([RecordStatus.pending, RecordStatus.pendingToClaim, RecordStatus.pendingToRefund].includes(record.result)) {
      return <Progress percent={50} className="max-w-xs" />;
    }

    if (isHelixRecord(record)) {
      if (record.result === RecordStatus.success) {
        return <Hash network={arrival} hash={record.responseTxHash} />;
      }

      if (record.result === RecordStatus.refunded) {
        return record.responseTxHash && <Hash network={departure} hash={record.responseTxHash} />;
      }
    } else if (isCBridgeRecord(record)) {
      return (
        <Hash network={record.result === RecordStatus.refunded ? departure : arrival} hash={record.responseTxHash} />
      );
    } else if (isXCMRecord(record)) {
      return <Hash network={arrival} hash={record.responseTxHash} />;
    }

    return null;
  }, [arrival, departure, record]);

  return (
    <TransferDescription
      title={t('Target Tx Hash')}
      tip={t('Unique character string (TxID) assigned to every verified transaction on the Target Chain.')}
    >
      {content}
    </TransferDescription>
  );
}
