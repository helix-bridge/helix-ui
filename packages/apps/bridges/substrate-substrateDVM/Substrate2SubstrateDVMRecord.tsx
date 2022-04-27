import { RecordComponentProps, PolkadotChainConfig } from 'shared/model';
import { isSubstrate2SubstrateDVM, convertToSS58 } from 'shared/utils';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Subscription, switchMapTo, tap } from 'rxjs';
import { IndexingState, Progresses, ProgressProps, State } from '../../components/record/Progress';
import { Record } from '../../components/record/Record';
import { BridgeDispatchEventRecord } from '../../model';
import { useRecords } from './hooks';
import {
  Substrate2SubstrateDVMRecord as S2SDVMRecord,
  Substrate2SubstrateDVMRecordRes,
  SubstrateDVM2SubstrateRecordRes,
} from './model';

export function Substrate2SubstrateDVMRecord({
  record: originRecord,
  departure,
  arrival,
}: RecordComponentProps<S2SDVMRecord, PolkadotChainConfig, PolkadotChainConfig>) {
  const { t } = useTranslation();
  const { fetchIssuingRecord, fetchRedeemRecord, fetchMessageEvent } = useRecords(departure!, arrival!);
  const isRedeem = useMemo(() => departure && departure.mode === 'dvm', [departure]);
  const [record, setRecord] = useState(originRecord);
  const [messageEvent, setMessageEvent] = useState<BridgeDispatchEventRecord | null>(null);

  const transactionSend = useMemo(
    () => ({
      title: t('{{chain}} Sent', { chain: departure?.name }),
      steps: [{ state: State.completed }],
      network: departure,
    }),
    [departure, t]
  );

  const originLocked = useMemo(
    () => ({
      title: t('{{chain}} Locked', { chain: departure?.name }),
      steps: [{ state: record.requestTxHash ? State.completed : State.pending, txHash: record.requestTxHash }],
      network: departure,
      icon: 'lock.svg',
    }),
    [departure, record.requestTxHash, t]
  );

  // eslint-disable-next-line complexity
  const bridgeDelivered = useMemo<ProgressProps>(() => {
    const { result } = record;

    let state = result;
    let txHash;

    if (messageEvent) {
      state = messageEvent.isSuccess ? State.completed : State.error;
      txHash = messageEvent.block.extrinsicHash;
    }

    return {
      title: t(result === State.error ? '{{chain}} Deliver Failed' : '{{chain}} Delivered', { chain: arrival?.name }),
      steps: [
        {
          state,
          txHash,
          indexing: !txHash
            ? IndexingState.indexing
            : messageEvent && messageEvent.method === 'MessageDispatched'
            ? IndexingState.success
            : IndexingState.fail,
          deliverMethod: messageEvent?.method,
        },
      ],
      network: arrival,
    };
  }, [arrival, messageEvent, record, t]);

  const originConfirmed = useMemo(() => {
    const { result: state, responseTxHash: txHash } = record;

    return {
      title: t(state === State.error ? '{{chain}} Confirm Failed' : '{{chain}} Confirmed', { chain: departure?.name }),
      steps: [{ state, txHash, deliverMethod: messageEvent?.method }],
      network: departure,
    };
  }, [departure, messageEvent, record, t]);

  const { count, currency } = useMemo<{ count: string; currency: string }>(
    () => ({ count: record.amount, currency: `${isRedeem ? 'x' : ''}${departure?.isTest ? 'O' : ''}RING` }),
    [record.amount, isRedeem, departure]
  );

  const progresses = [transactionSend, originLocked, bridgeDelivered, originConfirmed];

  useEffect(() => {
    const { laneId, nonce, result } = record;
    const attemptsCount = 100;
    const isS2DVM = isSubstrate2SubstrateDVM(departure!, arrival!);
    const queryOriginRecord = isS2DVM ? fetchIssuingRecord : fetchRedeemRecord;
    let subscription: Subscription | null = null;

    /**
     * Polling events of `bridgeDispatch` section, if MessageDispatched event occurred and it's result is ok, deliver success
     * other events represents failed.
     */
    if (record.result === State.pending) {
      subscription = fetchMessageEvent(laneId, nonce, { attemptsCount })
        .pipe(
          tap(setMessageEvent),
          switchMapTo(
            queryOriginRecord(laneId, nonce, {
              attemptsCount,
              keepActive: (res) => {
                const event =
                  (res as SubstrateDVM2SubstrateRecordRes).burnRecordEntity ||
                  (res as Substrate2SubstrateDVMRecordRes).s2sEvent;

                return event.result === result;
              },
              skipCache: true,
            })
          )
        )
        .subscribe(setRecord);
    } else {
      subscription = fetchMessageEvent(laneId, nonce, { attemptsCount }).subscribe(setMessageEvent);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRecord(originRecord);
  }, [originRecord]);

  return (
    <Record
      departure={departure}
      arrival={arrival}
      blockTimestamp={+(record.endTimestamp || record.startTimestamp || Date.now())}
      recipient={isRedeem ? convertToSS58(record.recipient, arrival?.ss58Prefix ?? null) : record.recipient}
      assets={[{ amount: count, currency, decimals: 9 }]}
      items={progresses}
    >
      <Progresses items={progresses} />
    </Record>
  );
}
