import BN from 'bn.js';
import { Token } from './token';
import { WithOptional } from './type-operator';

type KeypairType = 'ed25519' | 'sr25519' | 'ecdsa' | 'ethereum';
interface InjectedAccountWithMeta {
  address: string;
  meta: {
    genesisHash?: string | null;
    name?: string;
    source: string;
  };
  type?: KeypairType;
}

export type IAccountMeta = WithOptional<InjectedAccountWithMeta, 'meta'>;

// eslint-disable-next-line no-magic-numbers
export type Erc20RegisterStatus = 0 | 1 | 2;

export interface PolkadotChain {
  tokens: Token[];
  ss58Format: string;
}

export interface AvailableBalance<T = string> {
  max: string | number | BN;
  asset: T;
  token: Token;
}

export interface DailyLimit {
  limit: string | number;
  spentToday: string | number;
}
