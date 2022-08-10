import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { AvalanchePolygonBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<AvalanchePolygonBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<AvalanchePolygonBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
