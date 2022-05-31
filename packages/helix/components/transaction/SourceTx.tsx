import { Typography } from 'antd';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { toVertices } from 'shared/utils/network';
import { TransferDescription } from './TransferDescription';

export function SourceTx({ hash }: { hash: string | undefined }) {
  const { t } = useTranslation();
  const router = useRouter();
  const departure = toVertices(router.query.from as string);

  return (
    <TransferDescription
      title={t('Source Tx Hash')}
      tip={t('Unique character string (TxID) assigned to every verified transaction on the Source Chain.')}
    >
      {hash && (
        <SubscanLink network={departure} txHash={hash} className="hover:opacity-80 transition-opacity duration-200">
          <Typography.Text copyable className="truncate">
            {hash}
          </Typography.Text>
        </SubscanLink>
      )}
    </TransferDescription>
  );
}
