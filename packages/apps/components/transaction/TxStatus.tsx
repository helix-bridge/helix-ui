import { CrossChainState } from 'shared/components/widget/CrossChainStatus';
import { RecordStatus } from 'shared/config/constant';
import { useITranslation } from 'shared/hooks/translation';
import { HelixHistoryRecord } from 'shared/model';
import { TransferDescription } from './TransferDescription';

export function TxStatus({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useITranslation();

  return (
    <TransferDescription
      title={t('Status')}
      tip={t('The status of the cross-chain transaction: Success, Pending, or Reverted.')}
    >
      <CrossChainState
        value={record?.result ?? RecordStatus.pending}
        className="relative"
        detailedState
      ></CrossChainState>

      {record?.result === RecordStatus.refunded && <span>{record.reason}</span>}
    </TransferDescription>
  );
}
