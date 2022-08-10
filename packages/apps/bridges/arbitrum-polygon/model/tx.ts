import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { ArbitrumPolygonBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<ArbitrumPolygonBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<ArbitrumPolygonBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
