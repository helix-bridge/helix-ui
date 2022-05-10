import { FormInstance } from 'antd';
import React from 'react';
import { Subscription } from 'rxjs';
import { ChainConfig, TokenWithBridgesInfo } from '../network';
import { NullableFields } from '../type-operator';
import { Bridge, BridgeConfig, BridgeStatus } from './bridge';

export type TokenInfoWithMeta<T extends ChainConfig = ChainConfig> = TokenWithBridgesInfo & { meta: T };

export type CrossToken<T extends ChainConfig = ChainConfig> = TokenInfoWithMeta<T> & {
  amount: string;
};

export interface CrossChainPayload<
  B extends Bridge = Bridge,
  F extends CrossToken = CrossToken,
  T extends CrossToken = CrossToken
> extends CrossChainParty {
  bridge: B;
  direction: CrossChainDirection<F, T>;
}

export type SubmitFn = (value: CrossChainPayload) => Subscription;

export interface BridgeState {
  status: BridgeStatus;
  reason?: string;
}

export interface CrossChainComponentProps<
  B extends BridgeConfig = BridgeConfig,
  F extends CrossToken = CrossToken,
  T extends CrossToken = CrossToken
> {
  form: FormInstance<CrossChainPayload>;
  direction: CrossChainDirection<F, T>;
  bridge: Bridge<B>;
  setSubmit: React.Dispatch<React.SetStateAction<SubmitFn>>;
  setBridgeState: (state: BridgeState) => void;
  onFeeChange: (value: number | null) => void;
}

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
