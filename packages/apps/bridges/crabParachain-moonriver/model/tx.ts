import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { CrabParachainMoonriverBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabParachainMoonriverBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabParachainMoonriverBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
