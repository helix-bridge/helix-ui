import { createContext, useCallback, useContext, useState } from 'react';
import type { Subscription } from 'rxjs/internal/Subscription';
import { HelixHistoryRecord, Tx } from 'shared/model';
import { claim as substrateDVM2EthereumClaim } from '../bridges/helix/substrateDVM-ethereum/utils/tx';
import { useTx } from './tx';

interface Claimed {
  id: string;
  hash: string;
}

interface ClaimCtx {
  isClaiming: boolean;
  eth2Claim: (record: HelixHistoryRecord) => Subscription;
  claimedList: Claimed[];
  refundedList: Claimed[];
  onRefundSuccess: (data: Claimed) => void;
}

export const ClaimContext = createContext<ClaimCtx | null>(null);

export const ClaimProvider = ({ children }: React.PropsWithChildren<unknown>) => {
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
          observer.next({ status: 'error', error: new Error('Some error occurred during contract call') });
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

  const eth2Claim = useCallback(
    (record: HelixHistoryRecord) => substrateDVM2EthereumClaim(record).subscribe(genObserver(record)),
    [genObserver]
  );

  return (
    <ClaimContext.Provider
      value={{
        claimedList,
        eth2Claim,
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
