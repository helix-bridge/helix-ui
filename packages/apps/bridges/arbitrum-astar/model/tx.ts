import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { ArbitrumAstarBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<ArbitrumAstarBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<ArbitrumAstarBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
