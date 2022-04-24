import { Network, NetworkMode } from './network';

export interface Action<U, T = string> {
  type: U;
  payload: T;
}

export type Config<T extends string, U> = { [key in T]: U };

export type NetworkThemeConfig<T> = Config<Network, T>;

export interface NetworkQueryParams {
  from: Network;
  to: Network;
  fromMode: NetworkMode;
  toMode: NetworkMode;
}

export enum DarwiniaAsset {
  ring = 'ring',
  kton = 'kton',
  crab = 'crab',
}
