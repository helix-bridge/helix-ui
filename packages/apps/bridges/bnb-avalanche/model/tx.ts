import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { BnbAvalancheBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<BnbAvalancheBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<BnbAvalancheBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
