import type { Observable } from 'rxjs';
import { Bridge, CrossChainPayload } from './bridge';

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

export type TxConfirmComponentProps<T extends Bridge = Bridge> = { value: CrossChainPayload<T> };

export type TxDoneComponentProps<T extends Bridge = Bridge> = {
  tx: Tx;
  value: CrossChainPayload<T>;
};

export type CommonPayloadKeys = 'sender' | 'recipient' | 'amount' | 'asset';
