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

export type Erc20RegisterStatus = 0 | 1 | 2;

export interface PolkadotChainSimpleToken {
  tokens: Pick<Token, 'symbol' | 'decimals'>[];
  ss58Format: string;
}

export type AvailableBalance = {
  balance: BN;
} & Pick<Token, 'symbol' | 'decimals'>;

export interface DailyLimit {
  limit: string | number;
  spentToday: string | number;
}
