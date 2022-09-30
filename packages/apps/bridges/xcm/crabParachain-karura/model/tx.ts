import { BridgeBase, CrossChainPayload, CrossToken, ParachainChainConfig } from 'shared/model';
import { CrabParachainKaruraBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  BridgeBase<CrabParachainKaruraBridgeConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  BridgeBase<CrabParachainKaruraBridgeConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>;
