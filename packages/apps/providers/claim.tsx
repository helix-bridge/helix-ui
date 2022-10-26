import { createContext, useCallback, useContext, useState } from 'react';
import { EMPTY, switchMap } from 'rxjs';
import type { Subscription } from 'rxjs/internal/Subscription';
import { HelixHistoryRecord, Tx } from 'shared/model';
import { applyModalObs } from 'shared/utils/tx/common';
import { bridgeFactory } from '../bridges/bridges';
import { useITranslation } from '../hooks';
import { getBridge } from '../utils';
import { useTx } from './tx';

interface Claimed {
  id: string;
  hash: string;
}

interface ClaimCtx {
  isClaiming: boolean;
  claim: (record: HelixHistoryRecord) => Subscription;
  claimedList: Claimed[];
  refundedList: Claimed[];
  onRefundSuccess: (data: Claimed) => void;
}

export const ClaimContext = createContext<ClaimCtx | null>(null);

export const ClaimProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { t } = useITranslation();
  const { observer } = useTx();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedList, setClaimedList] = useState<Claimed[]>([]);
  const [refundedList, setRefundedList] = useState<Claimed[]>([]);

  const genObserver = useCallback(
    (record: HelixHistoryRecord) => {
      return {
        ...observer,
        next: (state: Tx) => {
          if (state.status === 'finalized' && state.hash) {
            setClaimedList((pre) => [...pre, { id: record.id, hash: state.hash! }]);
          }
          observer.next(state);
        },
        error: (err: unknown) => {
          observer.error({ status: 'error', error: new Error('Some error occurred during contract call') });
          console.error('🚀 ~ file: claim.tsx ~ line 80 ~ ClaimProvider ~ err', err);
          setIsClaiming(false);
        },
        complete: () => {
          observer.complete();
          setIsClaiming(false);
        },
      };
    },
    [observer]
  );

  const claim = useCallback(
    (record: HelixHistoryRecord) => {
      const { fromChain, toChain } = record;
      const config = getBridge([fromChain, toChain]);
      const bridge = bridgeFactory(config);

      if (bridge && bridge.claim) {
        return applyModalObs({
          title: <h3>{t('Confirm To Continue')}</h3>,
          content: (
            <span>
              {t('This transaction will be claim to {{account}}, are you sure to execute it?', {
                account: record.sender,
              })}
            </span>
          ),
        })
          .pipe(switchMap((confirmed) => (confirmed ? bridge.claim!(record) : EMPTY)))
          .subscribe(genObserver(record));
      } else {
        console.warn(
          `The bridge from ${fromChain} to ${toChain} not exist, or the claim method on the bridge doest not implemented`
        );
        return EMPTY.subscribe();
      }
    },
    [genObserver, t]
  );

  return (
    <ClaimContext.Provider
      value={{
        claimedList,
        claim,
        isClaiming,
        refundedList,
        onRefundSuccess: (data) => setRefundedList((pre) => [...pre, data]),
      }}
    >
      {children}
    </ClaimContext.Provider>
  );
};

export const useClaim = () => useContext(ClaimContext) as Exclude<ClaimCtx, null>;
