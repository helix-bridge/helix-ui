import type ExtType from '@polkadot/extension-inject/types';
import BN from 'bn.js';
import { Token } from './token';
import { WithOptional } from './type-operator';

export type InjectedAccountWithMeta = ExtType.InjectedAccountWithMeta;

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
