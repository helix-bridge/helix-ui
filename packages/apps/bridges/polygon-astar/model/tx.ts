import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { PolygonAstarBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<PolygonAstarBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<PolygonAstarBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
