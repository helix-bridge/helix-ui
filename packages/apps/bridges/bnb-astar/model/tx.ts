import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { BnbAstarBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<BnbAstarBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<BnbAstarBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
