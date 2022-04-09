import { ApiPromise } from '@polkadot/api';
import { IAccountMeta } from './account';
import { PolkadotTypeNetwork } from './network';

/**
 * pending: initial state, indicate that the connection never launched.
 */
export enum ConnectionStatus {
  pending = 'pending',
  connecting = 'connecting',
  success = 'success',
  fail = 'fail',
  disconnected = 'disconnected',
  error = 'error',
}

export type ConnectionType = 'polkadot' | 'metamask' | 'tron' | 'unknown';

export interface Connection {
  status: ConnectionStatus;
  accounts: IAccountMeta[];
  type: ConnectionType;
  [key: string]: unknown;
}

export interface PolkadotConnection extends Connection {
  api: ApiPromise | null;
  network: PolkadotTypeNetwork;
}

export interface EthereumConnection extends Connection {
  chainId: string;
}

export type TronConnection = Connection;
