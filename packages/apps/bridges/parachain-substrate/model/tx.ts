import { Bridge, CrossChainPayload, CrossToken, PolkadotChainConfig } from 'shared/model';
import { Parachain2SubstrateBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<Parachain2SubstrateBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<PolkadotChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<Parachain2SubstrateBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<PolkadotChainConfig>
>;
