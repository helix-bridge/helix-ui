import { FormInstance } from 'antd';
import BN from 'bn.js';
import React from 'react';
import { Observable } from 'rxjs';
import { ChainConfig, TokenWithBridgesInfo } from '../network';
import { Tx } from '../tx';
import { NullableFields } from '../type-operator';
import { Bridge, BridgeConfig, BridgeStatus } from './bridge';

export type TokenInfoWithMeta<T extends ChainConfig = ChainConfig> = TokenWithBridgesInfo & { meta: T };

export type CrossToken<T extends ChainConfig = ChainConfig> = TokenInfoWithMeta<T> & {
  amount: string;
};

export interface CrossChainParty {
  recipient: string;
  sender: string;
}

export interface CrossChainPayload<
  B extends Bridge = Bridge,
  F extends CrossToken = CrossToken,
  T extends CrossToken = CrossToken
> extends CrossChainParty {
  bridge: B;
  direction: CrossChainDirection<F, T>;
  slippage?: number;
}

export type TxObservableFactory = (value: CrossChainPayload) => Observable<Tx>;

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
  balances: BN[] | null;
  allowance: BN | null;
  // make sure page setState function direction to avoid infinite update
  setTxObservableFactory: React.Dispatch<React.SetStateAction<TxObservableFactory>>;
  setBridgeState: React.Dispatch<React.SetStateAction<BridgeState>>;
  onFeeChange: React.Dispatch<React.SetStateAction<{ amount: number; symbol: string } | null>>;
  updateAllowancePayload: React.Dispatch<React.SetStateAction<{ spender: string; tokenAddress: string } | null>>;
}

export interface CrossChainDirection<F = CrossToken, T = CrossToken> {
  from: F;
  to: T;
}

export type NullableCrossChainDirection = NullableFields<CrossChainDirection, 'from' | 'to'>;
