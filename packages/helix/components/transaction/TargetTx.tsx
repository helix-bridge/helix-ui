import { Progress, Typography } from 'antd';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { CrossChainStatus } from 'shared/config/constant';
import { HelixHistoryRecord, Network } from 'shared/model';
import { TransferDescription } from './TransferDescription';

export function TargetTx({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useTranslation();
  const router = useRouter();
  const departure = router.query.from as Network;
  const arrival = router.query.to as Network;

  return (
    <TransferDescription
      title={t('Target Tx Hash')}
      tip={t('Unique character string (TxID) assigned to every verified transaction on the Target Chain.')}
    >
      {record && record.responseTxHash ? (
        <SubscanLink
          network={record.result === CrossChainStatus.reverted ? departure : arrival}
          txHash={record.responseTxHash}
          className="hover:opacity-80 transition-opacity duration-200"
        >
          <Typography.Text copyable className="truncate">
            {record.responseTxHash}
          </Typography.Text>
        </SubscanLink>
      ) : (
        <Progress percent={50} className="max-w-xs" />
      )}
    </TransferDescription>
  );
}
