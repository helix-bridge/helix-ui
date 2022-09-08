import { notification } from 'antd';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { of } from 'rxjs/internal/observable/of';
import { delay } from 'rxjs/internal/operators/delay';
import type { Observer } from 'rxjs/internal/types';
import { TxStatus } from 'shared/components/widget/TxStatus';
import { LONG_DURATION } from 'shared/config/constant';
import { RequiredPartial, Tx } from 'shared/model';
import { useITranslation } from '../hooks';

export interface TxCtx {
  setTx: (tx: Tx | null) => void;
  setCanceler: React.Dispatch<React.SetStateAction<(() => void) | null>>;
  tx: Tx | null;
  observer: Observer<Tx>;
}

export const TxContext = createContext<TxCtx | null>(null);

export const useTx = () => useContext(TxContext) as Exclude<TxCtx, null>;

export const TxProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { t } = useITranslation();
  const [tx, setTx] = useState<Tx | null>(null);
  const [canceler, setCanceler] = useState<(() => void) | null>(null);

  const observer = useMemo<Observer<Tx>>(() => {
    return {
      next: setTx,
      error: (error: RequiredPartial<Tx, 'error'>) => {
        const errInfo = typeof error.error === 'string' ? error.error : error.error.message;

        notification.error({
          message: (
            <div>
              <p>{t('Transaction aborted because of')}</p>
              <p className="font-bold">{errInfo}</p>
            </div>
          ),
          duration: 5,
        });
        setTx(null);
      },
      complete: () => {
        console.log('🛫 ~ Transaction sent or terminated!');
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
