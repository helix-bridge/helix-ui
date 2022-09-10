import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Network } from 'shared/model';
import { Hash } from './Hash';
import { TransferDescription } from './TransferDescription';

export function SourceTx({ hash }: { hash: string | undefined }) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <TransferDescription
      title={t('Source Tx Hash')}
      tip={t('Unique character string (TxID) assigned to every verified transaction on the Source Chain.')}
    >
      {hash && <Hash network={router.query.from as Network} hash={hash} />}
    </TransferDescription>
  );
}
