import { ChainConfig, TokenWithBridgesInfo } from '../network';
import { NullableFields } from '../type-operator';
import { BridgeStatus } from './bridge';

export type TokenInfoWithMeta<T extends ChainConfig = ChainConfig> = TokenWithBridgesInfo & { meta: T };

export type CrossToken<T extends ChainConfig = ChainConfig> = TokenInfoWithMeta<T> & {
  amount: string;
};

export interface BridgeState {
  status: BridgeStatus;
  reason?: string;
}

export interface CrossChainDirection<F = CrossToken, T = CrossToken> {
  from: F;
  to: T;
}

export interface CrossChainPureDirection<F = TokenInfoWithMeta, T = TokenInfoWithMeta> {
  from: F;
  to: T;
}

export type NullableCrossChainDirection = NullableFields<CrossChainDirection, 'from' | 'to'>;
