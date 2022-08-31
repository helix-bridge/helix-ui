import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ExplorerLink } from 'shared/components/widget/ExplorerLink';
import { TextWithCopy } from 'shared/components/widget/TextWithCopy';
import { Network } from 'shared/model';
import { TransferDescription } from './TransferDescription';

export function SourceTx({ hash }: { hash: string | undefined }) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <TransferDescription
      title={t('Source Tx Hash')}
      tip={t('Unique character string (TxID) assigned to every verified transaction on the Source Chain.')}
    >
      {hash && (
        <ExplorerLink
          network={router.query.from as Network}
          txHash={hash}
          className="hover:opacity-80 transition-opacity duration-200"
        >
          <TextWithCopy underline>{hash}</TextWithCopy>
        </ExplorerLink>
      )}
    </TransferDescription>
  );
}
