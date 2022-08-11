import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { BSCAstarBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<BSCAstarBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<BSCAstarBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
