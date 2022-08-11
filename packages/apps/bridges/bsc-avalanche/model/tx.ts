import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { BSCAvalancheBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<BSCAvalancheBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<BSCAvalancheBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
