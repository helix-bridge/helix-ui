import type { ApiPromise } from '@polkadot/api';
import { IAccountMeta } from './account';
import { PolkadotTypeNetwork, SupportedWallet } from './network';

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

export interface Connection {
  status: ConnectionStatus;
  accounts: IAccountMeta[];
  type: SupportedWallet | 'unknown';
  chainId: PolkadotTypeNetwork | string;
}

export interface PolkadotConnection extends Connection {
  api: ApiPromise | null;
}

export type EthereumConnection = Connection;
