import { Button, message, Popconfirm } from 'antd';
import request from 'graphql-request';
import { useCallback, useState } from 'react';
import { from, map, of, switchMap } from 'rxjs';
import { CBridgeRecordStatus, LONG_DURATION } from 'shared/config/constant';
import { ENDPOINT } from 'shared/config/env';
import { useIsMounted } from 'shared/hooks';
import { HelixHistoryRecord } from 'shared/model';
import { gqlName, pollWhile } from 'shared/utils/helper';
import { requestRefund, withdraw } from '../../bridges/crabDVM-heco/utils/tx';
import { HISTORY_RECORD_BY_ID } from '../../config/gql';
import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';
import { useTx } from '../../providers';

export function PendingToRefund({ record }: RecordStatusComponentProps) {
  const { t } = useITranslation();
  const [loading, setLoading] = useState(false);
  const { observer } = useTx();
  const isMounted = useIsMounted();
  const [reason, setReason] = useState(record.reason);

  const pollingRefundState = useCallback(() => {
    of(null)
      .pipe(
        switchMap(() => from(request(ENDPOINT, HISTORY_RECORD_BY_ID, { id: record.id }))),
        map((res) => res && res[gqlName(HISTORY_RECORD_BY_ID)]),
        pollWhile(
          LONG_DURATION,
          (res: HelixHistoryRecord) =>
            isMounted && res.reason !== CBridgeRecordStatus[CBridgeRecordStatus.refundToBeConfirmed]
        )
      )
      .subscribe({
        next(result) {
          setReason(result.reason);
        },
        error(err) {
          console.warn(`🚨 polling status error: ${err}`);
          setLoading(false);
        },
        complete() {
          setLoading(false);
        },
      });
  }, [isMounted, record.id]);

  if (reason === CBridgeRecordStatus[CBridgeRecordStatus.refundToBeConfirmed]) {
    return (
      <Popconfirm
        placement="bottom"
        title={t('Click the "Confirm Refund" button to get your refund.')}
        onConfirm={() => {
          setLoading(true);

          withdraw(record).subscribe({
            next(response) {
              observer.next(response);
            },
            error(err) {
              observer.error(err);
              setLoading(false);
            },
            complete() {
              observer.complete();
              setLoading(false);
            },
          });
        }}
        trigger="hover"
        okText={t('Confirm Refund')}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <Button size="small" disabled={loading}>
          {t('Refund')}
        </Button>
      </Popconfirm>
    );
  }

  return (
    <Popconfirm
      placement="bottom"
      title={
        <div className="w-64">
          {t(
            'The transfer cannot be completed because the bridge rate has moved unfavorably by your slippage tolerance. Please click the button below to get a refund.'
          )}
        </div>
      }
      trigger="hover"
      okText={t('Confirm')}
      onConfirm={() => {
        setLoading(true);

        requestRefund(record)
          .then((res) => {
            const { err } = res.toObject();

            if (err) {
              message.error(err.msg);
            } else {
              pollingRefundState();
            }
          })
          .catch((err) => {
            message.error(err);
          });
      }}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <Button size="small" disabled={loading}>
        {t('Request Refund')}
      </Button>
    </Popconfirm>
  );
}
