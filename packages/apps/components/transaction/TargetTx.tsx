import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { RecordStatus } from 'shared/config/constant';
import { HelixHistoryRecord } from 'shared/model';
import { isCBridgeRecord, isHelixRecord, isXCMRecord } from '../../utils/record/record';
import { Hash } from './Hash';
import { TransferDescription } from './TransferDescription';

export function TargetTx({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useTranslation();

  // eslint-disable-next-line complexity
  const content = useMemo(() => {
    if (!record) {
      return null;
    }

    if ([RecordStatus.pending, RecordStatus.pendingToClaim, RecordStatus.pendingToRefund].includes(record.result)) {
      return <span>{t('Waiting for the transaction on the target chain...')}</span>;
    }

    const departure = record.fromChain;
    const arrival = record.toChain;

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
  }, [record, t]);

  return (
    <TransferDescription
      title={t('Target Tx Hash')}
      tip={t('Unique character string (TxID) assigned to every verified transaction on the Target Chain.')}
    >
      {content}
    </TransferDescription>
  );
}
