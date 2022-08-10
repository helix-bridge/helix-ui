import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { ArbitrumOptimismBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<ArbitrumOptimismBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<ArbitrumOptimismBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
