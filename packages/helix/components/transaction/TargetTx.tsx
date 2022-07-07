import { Progress, Typography } from 'antd';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { CrossChainStatus } from 'shared/config/constant';
import { HelixHistoryRecord, Network } from 'shared/model';
import { TransferDescription } from './TransferDescription';

export function TargetTx({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useTranslation();
  const router = useRouter();
  const departure = router.query.from as Network;
  const arrival = router.query.to as Network;

  const content = useMemo(() => {
    if (record?.result === CrossChainStatus.pending) {
      return <Progress percent={50} className="max-w-xs" />;
    }

    if (record?.result === CrossChainStatus.success) {
      return (
        <SubscanLink
          network={arrival}
          txHash={record?.targetTxHash}
          className="hover:opacity-80 transition-opacity duration-200"
        >
          <Typography.Text copyable className="truncate">
            {record?.targetTxHash}
          </Typography.Text>
        </SubscanLink>
      );
    }

    if (record?.result === CrossChainStatus.reverted) {
      return (
        <SubscanLink
          network={departure}
          txHash={record.responseTxHash!}
          className="hover:opacity-80 transition-opacity duration-200"
        >
          <Typography.Text copyable className="truncate">
            {record?.responseTxHash}
          </Typography.Text>
        </SubscanLink>
      );
    }

    return null;
  }, [arrival, departure, record]);

  return (
    <TransferDescription
      title={t('Target Tx Hash')}
      tip={t('Unique character string (TxID) assigned to every verified transaction on the Target Chain.')}
    >
      {content}
    </TransferDescription>
  );
}
