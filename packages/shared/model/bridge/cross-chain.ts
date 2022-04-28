import { FormInstance } from 'antd';
import { Subscription } from 'rxjs';
import { TokenWithBridgesInfo } from '../network';
import { NullableFields } from '../type-operator';
import { BridgeStatus } from './bridge';

/* ---------------------------------------------------Components props--------------------------------------------------- */

export interface CrossToken extends TokenWithBridgesInfo {
  amount: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CrossChainPayload<C = any, F extends CrossToken = CrossToken, T extends CrossToken = CrossToken> = {
  direction: CrossChainDirection<F, T>;
} & C;

export type SubmitFn = (value: CrossChainPayload) => Subscription;

export interface BridgeState {
  status: BridgeStatus;
  reason?: string;
}

export interface CrossChainComponentProps<
  C extends CrossChainParty,
  F extends CrossToken = CrossToken,
  T extends CrossToken = CrossToken
> {
  form: FormInstance<CrossChainPayload<C>>;
  direction: CrossChainDirection<F, T>;
  setSubmit: React.Dispatch<React.SetStateAction<SubmitFn>>;
  setBridgeState: React.Dispatch<React.SetStateAction<BridgeState>>;
}

/* ---------------------------------------------------Bridge elements--------------------------------------------------- */

export interface CrossChainDirection<F = CrossToken, T = CrossToken> {
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
