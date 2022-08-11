import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { BSCOptimismBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<BSCOptimismBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<BSCOptimismBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
