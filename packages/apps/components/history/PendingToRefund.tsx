import { SyncOutlined } from '@ant-design/icons';
import { Button, message, Tooltip } from 'antd';
import { useManualQuery } from 'graphql-hooks';
import { useCallback, useMemo, useState } from 'react';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { tap } from 'rxjs/internal/operators/tap';
import { CBridgeRecordStatus, LONG_DURATION } from 'shared/config/constant';
import { useIsMounted } from 'shared/hooks';
import { HelixHistoryRecord } from 'shared/model';
import { gqlName } from 'shared/utils/helper/common';
import { pollWhile } from 'shared/utils/helper/operator';
import { isSubstrateDVMEthereum, isSubstrateDVMSubstrateDVM } from 'utils/bridge';
import { requestRefund, withdraw } from '../../bridges/celer/cBridge/utils/tx';
import { refund as substrateDVMEthereumRefund } from '../../bridges/helix/substrateDVM-ethereum/utils';
import { refund } from '../../bridges/helix/substrateDVM-substrateDVM/utils';
import { HISTORY_RECORD_BY_ID } from '../../config/gql';
import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';
import { useClaim, useTx } from '../../providers';
import { isCBridgeRecord } from '../../utils/record';

interface RefundComponentProps extends RecordStatusComponentProps {
  onSuccess?: () => void;
}

function CBrideRefund({ record, onSuccess }: RefundComponentProps) {
  const { t } = useITranslation();
  const { onRefundSuccess } = useClaim();
  const [loading, setLoading] = useState(false);
  const { observer } = useTx();
  const isMounted = useIsMounted();
  const [reason, setReason] = useState(record.reason);
  const [request] = useManualQuery(HISTORY_RECORD_BY_ID, { variables: { id: record.id } });

  const pollingRefundState = useCallback(() => {
    of(null)
      .pipe(
        switchMap(() => from(request())),
        map(({ data }) => data && data[gqlName(HISTORY_RECORD_BY_ID)]),
        tap((res) => setReason(res.reason)),
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
  }, [isMounted, request]);

  if (reason === CBridgeRecordStatus[CBridgeRecordStatus.refundToBeConfirmed]) {
    return (
      <Button
        size="small"
        disabled={loading}
        type="primary"
        icon={loading ? <SyncOutlined spin /> : null}
        onClick={() => {
          setLoading(true);

          withdraw(record).subscribe({
            next(response) {
              observer.next(response);

              if (response.status === 'finalized') {
                onRefundSuccess({ id: record.id, hash: response.hash ?? '' });

                if (onSuccess) {
                  onSuccess();
                }
              }
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
      >
        {t('Refund')}
      </Button>
    );
  }

  return (
    <Tooltip
      title={t(
        'The transfer cannot be completed because the bridge rate has moved unfavorably by your slippage tolerance. Please click the button below to get a refund.'
      )}
    >
      <Button
        size="small"
        type="primary"
        disabled={loading}
        icon={loading ? <SyncOutlined spin /> : null}
        onClick={() => {
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
      >
        {loading ? t('Waiting for Response') : t('Request Refund')}
      </Button>
    </Tooltip>
  );
}

function Refund({ record, onSuccess }: RefundComponentProps) {
  const { t } = useITranslation();
  const { onRefundSuccess } = useClaim();
  const [loading, setLoading] = useState(false);
  const { observer } = useTx();

  const refundFn = useMemo(() => {
    const { fromChain, toChain } = record;
    if (isSubstrateDVMSubstrateDVM(fromChain, toChain)) {
      return refund;
    }

    if (isSubstrateDVMEthereum(fromChain, toChain)) {
      return substrateDVMEthereumRefund;
    }

    return (history: HelixHistoryRecord) => {
      console.warn(`No refund method implemented for ${history.fromChain} to ${history.toChain} transfer!`);
      return EMPTY;
    };
  }, [record]);

  return (
    <Button
      size="small"
      disabled={loading}
      type="primary"
      icon={loading ? <SyncOutlined spin /> : null}
      onClick={(event) => {
        event.stopPropagation();
        setLoading(true);

        refundFn(record).subscribe({
          next(response) {
            observer.next(response);

            if (response.status === 'finalized') {
              onRefundSuccess({ id: record.id, hash: response.hash ?? '' });

              if (onSuccess) {
                onSuccess();
              }
            }
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
    >
      {t('Refund')}
    </Button>
  );
}

export function PendingToRefund({ record, onSuccess }: RefundComponentProps) {
  if (isCBridgeRecord(record)) {
    return <CBrideRefund record={record} onSuccess={onSuccess} />;
  }

  return <Refund record={record} onSuccess={onSuccess} />;
}
