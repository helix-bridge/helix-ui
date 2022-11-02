import { useTranslation } from 'next-i18next';
import { HelixHistoryRecord } from 'shared/model';
import { Hash } from './Hash';
import { TransferDescription } from './TransferDescription';

export function SourceTx({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useTranslation();

  return (
    <TransferDescription
      title={t('Source Tx Hash')}
      tip={t('Unique character string (TxID) assigned to every verified transaction on the Source Chain.')}
    >
      {record?.requestTxHash && <Hash network={record.fromChain} hash={record.requestTxHash} />}
    </TransferDescription>
  );
}
