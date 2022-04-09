import { Network } from './network';

export interface Action<U, T = string> {
  type: U;
  payload: T;
}

export type Config<T extends string, U> = { [key in T]: U };

export type NetworkThemeConfig<T> = Config<Network, T>;

export type CrossType = 'cross-chain' | 'airdrop';

export enum DarwiniaAsset {
  ring = 'ring',
  kton = 'kton',
  crab = 'crab',
}
