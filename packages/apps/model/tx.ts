import { BridgeBase } from 'shared/core/bridge';
import { BridgeConfig, ChainConfig } from 'shared/model';
import { CrossChainDirection, CrossToken } from 'shared/model/bridge/cross-chain';
import { Bridge } from '../core/bridge';

interface CrossChainParty {
  recipient: string;
  sender: string;
}

export interface CrossChainPayload<
  B extends BridgeBase = BridgeBase,
  F extends CrossToken = CrossToken,
  T extends CrossToken = CrossToken
> extends CrossChainParty {
  bridge: B;
  direction: CrossChainDirection<F, T>;
  slippage?: number;
}

export type PayloadPatchFn = (
  value: CrossChainPayload<Bridge<BridgeConfig, ChainConfig, ChainConfig>>
) => CrossChainPayload<Bridge<BridgeConfig, ChainConfig, ChainConfig>> | null;
