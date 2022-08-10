import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { BnbPolygonBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<BnbPolygonBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<BnbPolygonBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
