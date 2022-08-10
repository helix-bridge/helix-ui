import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { ArbitrumAvalancheBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<ArbitrumAvalancheBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<ArbitrumAvalancheBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
