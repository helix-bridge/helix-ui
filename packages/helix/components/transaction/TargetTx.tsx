import { Progress } from 'antd';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { EllipsisMiddle } from 'shared/components/widget/EllipsisMiddle';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { CrossChainStatus } from 'shared/config/constant';
import { HelixHistoryRecord, UnlockedRecord } from 'shared/model';
import { toVertices } from 'shared/utils/network';
import { TransferDescription } from './TransferDescription';

export type FinalActionRecord = Pick<UnlockedRecord, 'txHash' | 'id' | 'recipient' | 'amount'>;

export function TargetTx({
  departureRecord,
  finalRecord,
}: {
  departureRecord?: HelixHistoryRecord | null;
  finalRecord: FinalActionRecord | null;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const departure = toVertices(router.query.from as string);
  const arrival = toVertices(router.query.to as string);

  return (
    <TransferDescription
      title={t('Target Tx Hash')}
      tip={t('Unique character string (TxID) assigned to every verified transaction on the Target Chain.')}
    >
      {finalRecord ? (
        <SubscanLink
          network={arrival}
          txHash={finalRecord?.txHash}
          className="hover:opacity-80 transition-opacity duration-200"
        >
          <EllipsisMiddle copyable>{finalRecord.txHash}</EllipsisMiddle>
        </SubscanLink>
      ) : departureRecord?.result === CrossChainStatus.reverted ? (
        <SubscanLink
          network={departure}
          txHash={departureRecord?.responseTxHash ?? ''}
          className="hover:opacity-80 transition-opacity duration-200"
        >
          <EllipsisMiddle copyable>{departureRecord.responseTxHash}</EllipsisMiddle>
        </SubscanLink>
      ) : (
        <Progress percent={50} className="max-w-xs" />
      )}
    </TransferDescription>
  );
}
