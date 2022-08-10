import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { EthereumOptimismBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<EthereumOptimismBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<EthereumOptimismBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
