import { BridgeBase, CrossChainPayload, CrossToken, ParachainChainConfig } from 'shared/model';
import { CrabParachainMoonriverBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  BridgeBase<CrabParachainMoonriverBridgeConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  BridgeBase<CrabParachainMoonriverBridgeConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>;
