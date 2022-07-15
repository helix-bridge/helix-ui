import { useTranslation } from 'next-i18next';
import { CrossChainState } from 'shared/components/widget/CrossChainStatus';
import { CrossChainStatus } from 'shared/config/constant';
import { HelixHistoryRecord } from 'shared/model';
import { TransferDescription } from './TransferDescription';

export function TxStatus({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useTranslation();

  return (
    <TransferDescription
      title={t('Status')}
      tip={t('The status of the cross-chain transaction: Success, Pending, or Reverted.')}
    >
      <CrossChainState value={record?.result ?? CrossChainStatus.pending} className="relative"></CrossChainState>

      {record?.result === CrossChainStatus.reverted && record.bridgeDispatchError && (
        <span>{record?.bridgeDispatchError}</span>
      )}
    </TransferDescription>
  );
}
