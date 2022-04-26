import { Observable } from 'rxjs';
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

export type TxConfirmComponentProps<T> = { value: CrossChainPayload<T>; decimals?: number };

export type TxHashType = 'block' | 'extrinsic' | 'address' | 'txHash'; // consistent with the SubscanLink component props;

export type TxSuccessComponentProps<T> = {
  tx: Tx;
  value: CrossChainPayload<T>;
  hashType?: TxHashType;
  decimals?: number;
};

export type CommonPayloadKeys = 'sender' | 'recipient' | 'amount' | 'asset';
