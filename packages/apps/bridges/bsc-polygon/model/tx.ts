import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { BSCPolygonBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<BSCPolygonBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<BSCPolygonBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
