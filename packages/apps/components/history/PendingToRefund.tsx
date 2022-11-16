import { SyncOutlined } from '@ant-design/icons';
import { Button, message, Tooltip } from 'antd';
import { useManualQuery } from 'graphql-hooks';
import { useCallback, useState } from 'react';
import { EMPTY } from 'rxjs';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { tap } from 'rxjs/internal/operators/tap';
import { CBridgeRecordStatus, LONG_DURATION } from 'shared/config/constant';
import { useIsMounted } from 'shared/hooks';
import { HelixHistoryRecord } from 'shared/model';
import { revertAccount } from 'shared/utils/helper/address';
import { gqlName } from 'shared/utils/helper/common';
import { pollWhile } from 'shared/utils/helper/operator';
import { applyModalObs } from 'shared/utils/tx';
import { getBridge } from 'utils/bridge';
import { bridgeFactory } from '../../bridges/bridges';
import type { CBridgeBridge } from '../../bridges/cbridge/cBridge/utils';
import { HISTORY_RECORD_BY_ID } from '../../config/gql';
import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';
import { useTx } from '../../providers';
import { getOriginChainConfig } from '../../utils/network';
import { getDirectionFromHelixRecord, isCBridgeRecord } from '../../utils/record';

interface RefundComponentProps extends RecordStatusComponentProps {
  onSuccess?: () => void;
}

// eslint-disable-next-line complexity
function CBrideRefund({ record, onSuccess }: RefundComponentProps) {
  const { t } = useITranslation();
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
        error(_) {
          setLoading(false);
        },
        complete() {
          setLoading(false);
        },
      });
  }, [isMounted, request]);

  const findBridge = useCallback(() => {
    const direction = getDirectionFromHelixRecord(record);

    if (!direction) {
      message.error('Can not find the correct transfer direction from record!');
      return null;
    }
    const config = getBridge(direction, 'cBridge');

    return bridgeFactory(config) as CBridgeBridge;
  }, [record]);

  if (reason === CBridgeRecordStatus[CBridgeRecordStatus.refundToBeConfirmed]) {
    return (
      <Button
        size="small"
        disabled={loading}
        type="primary"
        icon={loading ? <SyncOutlined spin /> : null}
        onClick={() => {
          setLoading(true);
          const bridge = findBridge();

          bridge?.withdraw(record).subscribe({
            next(response) {
              observer.next(response);

              if (response.status === 'finalized' && onSuccess) {
                onSuccess();
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
          const bridge = findBridge();

          bridge
            ?.requestRefund(record)
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
  const [loading, setLoading] = useState(false);
  const { observer } = useTx();

  return (
    <Button
      size="small"
      disabled={loading}
      type="primary"
      icon={loading ? <SyncOutlined spin /> : null}
      onClick={(event) => {
        event.stopPropagation();
        setLoading(true);
        const direction = getDirectionFromHelixRecord(record);

        if (!direction) {
          message.error('Can not find the correct transfer direction from record!');
          return null;
        }

        const target = getBridge(direction, 'helix');
        const bridge = bridgeFactory(target);

        if (bridge && bridge.refund) {
          applyModalObs({
            title: <h3>{t('Confirm To Continue')}</h3>,
            content: (
              <span>
                {t('This transaction will be refund to {{account}}, are you sure to execute it?', {
                  account: revertAccount(record.sender, getOriginChainConfig(record.fromChain)),
                })}
              </span>
            ),
          })
            .pipe(switchMap((confirmed) => (confirmed ? bridge.refund!(record) : EMPTY)))
            .subscribe({
              next(response) {
                observer.next(response);

                if (response.status === 'finalized' && onSuccess) {
                  onSuccess();
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
        } else {
          //
        }
      }}
    >
      {loading ? t('Waiting for Response') : t('Refund')}
    </Button>
  );
}

export function PendingToRefund({ record }: RefundComponentProps) {
  const { t } = useITranslation();
  const [executed, setExecuted] = useState(false);

  if (executed) {
    return (
      <span className="flex items-center gap-2">
        <SyncOutlined spin />
        <span>{t('Executed, querying execution result')}</span>
      </span>
    );
  }

  if (isCBridgeRecord(record)) {
    return <CBrideRefund record={record} onSuccess={() => setExecuted(true)} />;
  }

  return <Refund record={record} onSuccess={() => setExecuted(true)} />;
}
