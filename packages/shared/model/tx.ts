import type { Observable } from 'rxjs';
import { BridgeBase } from '../core/bridge';
import { CrossChainPayload } from './bridge';

export type TxStatus =
  | 'future'
  | 'ready'
  | 'finalized'
  | 'finalitytimeout'
  | 'usurped'
  | 'dropped'
  | 'inblock'
  | 'invalid'
  | 'broadcast'
  | 'cancelled'
  | 'completed'
  | 'error'
  | 'incomplete'
  | 'queued'
  | 'qr'
  | 'retracted'
  | 'sending'
  | 'signing'
  | 'sent'
  | 'blocked';

export interface Tx {
  status: TxStatus;
  hash?: string;
  error?: Error;
}

export type TxFn<T> = (value: T) => Observable<Tx>;

export type TxConfirmComponentProps<T extends BridgeBase = BridgeBase> = { value: CrossChainPayload<T> };

export type TxDoneComponentProps<T extends BridgeBase = BridgeBase> = {
  tx: Tx;
  value: CrossChainPayload<T>;
};

export type CommonPayloadKeys = 'sender' | 'recipient' | 'amount' | 'asset';
