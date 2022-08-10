import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { AstarOptimismBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<AstarOptimismBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<AstarOptimismBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
