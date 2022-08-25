import { Bridge, CrossChainPayload, CrossToken, PolkadotChainConfig } from 'shared/model';
import { ParachainSubstrateBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<ParachainSubstrateBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<PolkadotChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<ParachainSubstrateBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<PolkadotChainConfig>
>;
