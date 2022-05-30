import { useTranslation } from 'next-i18next';
import { CrossChainState } from 'shared/components/widget/CrossChainStatus';
import { CrossChainStatus } from 'shared/config/constant';
import { Result } from 'shared/model';
import { TransferDescription } from './TransferDescription';

export function TxStatus({ result }: { result?: Result }) {
  const { t } = useTranslation();

  return (
    <TransferDescription
      title={t('Status')}
      tip={t('The status of the cross-chain transaction: Success, Pending, or Reverted.')}
    >
      <CrossChainState value={result ?? CrossChainStatus.pending} />
    </TransferDescription>
  );
}
