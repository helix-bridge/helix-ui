import { ReloadOutlined } from '@ant-design/icons';
import { isAfter } from 'date-fns';
import { i18n, Trans } from 'next-i18next';
import { useMemo } from 'react';
import { initReactI18next } from 'react-i18next';
import { CrossChainState } from 'shared/components/widget/CrossChainStatus';
import { RecordStatus } from 'shared/config/constant';
import { useITranslation } from 'shared/hooks/translation';
import { HelixHistoryRecord } from 'shared/model';
import { PendingToClaim } from '../history/PendingToClaim';
import { PendingToRefund } from '../history/PendingToRefund';
import { TransferDescription } from './TransferDescription';

// eslint-disable-next-line complexity
export function TxStatus({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useITranslation();
  const state = record?.result ?? RecordStatus.pending;
  const estimateMin = 5;
  const isTimeout = useMemo(
    () => record?.startTime && isAfter(new Date(), new Date(record.startTime * 1000 + estimateMin * 3600 * 1000)),
    [record?.startTime]
  );

  return (
    <TransferDescription
      title={t('Status')}
      tip={t('The status of the cross-chain transaction: Success, Pending, or Refunded.')}
    >
      <div className="flex items-center gap-2">
        <CrossChainState value={state} className="relative"></CrossChainState>

        {state === RecordStatus.pending && (
          <div className="flex items-center gap-2">
            <ReloadOutlined />
            {isTimeout ? (
              <span>
                <Trans i18nKey="txTimeout" i18n={i18n?.use(initReactI18next)}>
                  It seems to be taking longer than usual.
                  <a
                    href={`mailto:hello@helixbridge.app?subject=${encodeURIComponent(
                      'Transfer time out'
                    )}&body=${encodeURIComponent(location.href)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Contact us
                  </a>
                  for support.
                </Trans>
              </span>
            ) : (
              <span>{t('Estimated to wait 5 minutes ...')}</span>
            )}
          </div>
        )}

        {state === RecordStatus.pendingToClaim && record && (
          <div className="flex items-center gap-2">
            <span>{t('Please request claim on the source chain.')}</span>
            <PendingToClaim record={record} />
          </div>
        )}

        {state === RecordStatus.pendingToRefund && record && (
          <div className="flex items-center gap-2">
            <span>{t('Please request refund on the source chain.')}</span>
            <PendingToRefund record={record} />
          </div>
        )}

        {record?.result === RecordStatus.refunded && <span>{record.reason}</span>}
      </div>
    </TransferDescription>
  );
}
