import { FormInstance } from 'antd';
import { Subscription } from 'rxjs';
import { ChainConfig } from '../network';
import { NullableFields } from '../type-operator';

/* ---------------------------------------------------Components props--------------------------------------------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CrossChainPayload<C = any, F extends ChainConfig = ChainConfig, T extends ChainConfig = ChainConfig> = {
  direction: CrossChainDirection<F, T>;
} & C;

export type SubmitFn = (value: CrossChainPayload) => Subscription;

export interface CrossChainComponentProps<
  C extends CrossChainParty,
  F extends ChainConfig = ChainConfig,
  T extends ChainConfig = ChainConfig
> {
  form: FormInstance<CrossChainPayload<C>>;
  direction: CrossChainDirection<F, T>;
  setSubmit: React.Dispatch<React.SetStateAction<SubmitFn>>;
  setIsBridgeAvailable: React.Dispatch<React.SetStateAction<boolean>>;
}

/* ---------------------------------------------------Bridge elements--------------------------------------------------- */

export interface CrossChainDirection<F = ChainConfig, T = ChainConfig> {
  from: F;
  to: T;
}

export type NullableCrossChainDirection = NullableFields<CrossChainDirection, 'from' | 'to'>;

export interface CrossChainParty {
  recipient: string;
  sender: string;
}

/**
 * for native token, T = string;
 * for mapped token, T = Mapping Token;
 */
export interface CrossChainAsset<T = string> {
  amount: string;
  asset: T | null;
}
