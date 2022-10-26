import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { RecordStatus } from 'shared/config/constant';
import { HelixHistoryRecord, Network } from 'shared/model';
import { isCBridgeRecord, isHelixRecord, isXCMRecord } from '../../utils/record/record';
import { Hash } from './Hash';
import { TransferDescription } from './TransferDescription';

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
      return <span>{t('Waiting for the transaction on the target chain...')}</span>;
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
  }, [arrival, departure, record, t]);

  return (
    <TransferDescription
      title={t('Target Tx Hash')}
      tip={t('Unique character string (TxID) assigned to every verified transaction on the Target Chain.')}
    >
      {content}
    </TransferDescription>
  );
}
