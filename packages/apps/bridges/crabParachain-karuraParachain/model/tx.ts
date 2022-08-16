import { Bridge, CrossChainPayload, CrossToken, ParachainChainConfig } from 'shared/model';
import { CrabParachainKaruraParachainBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabParachainKaruraParachainBridgeConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabParachainKaruraParachainBridgeConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>;
