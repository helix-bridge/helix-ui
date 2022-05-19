import { message } from 'antd';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { delay, Observer, of } from 'rxjs';
import { TxStatus } from 'shared/components/widget/TxStatus';
import { LONG_DURATION } from 'shared/config/constant';
import { RequiredPartial, Tx } from 'shared/model';

export interface TxCtx {
  setTx: (tx: Tx | null) => void;
  setCanceler: React.Dispatch<React.SetStateAction<(() => void) | null>>;
  tx: Tx | null;
  observer: Observer<Tx>;
}

export const TxContext = createContext<TxCtx | null>(null);

export const useTx = () => useContext(TxContext) as Exclude<TxCtx, null>;

export const TxProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [tx, setTx] = useState<Tx | null>(null);
  const [canceler, setCanceler] = useState<(() => void) | null>(null);

  const observer = useMemo<Observer<Tx>>(() => {
    return {
      next: setTx,
      error: (error: RequiredPartial<Tx, 'error'>) => {
        message.error(error.error.message);
        setTx(null);
      },
      complete: () => {
        console.info('[ tx completed! ]');
      },
    };
  }, []);

  useEffect(() => {
    if (tx?.status === 'finalized' || tx?.status === 'error') {
      of(null).pipe(delay(LONG_DURATION)).subscribe(setTx);
    }
  }, [tx]);

  return (
    <TxContext.Provider value={{ setTx, tx, observer, setCanceler }}>
      {children}
      <TxStatus
        tx={tx}
        onClose={() => setTx(null)}
        cancel={() => {
          if (canceler) {
            canceler();
            setCanceler(null);
          }

          setTx(null);
        }}
      />
    </TxContext.Provider>
  );
};
