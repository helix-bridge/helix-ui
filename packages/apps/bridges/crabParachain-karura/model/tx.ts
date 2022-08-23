import { Bridge, CrossChainPayload, CrossToken, ParachainChainConfig } from 'shared/model';
import { CrabParachainKaruraBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabParachainKaruraBridgeConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabParachainKaruraBridgeConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>;
