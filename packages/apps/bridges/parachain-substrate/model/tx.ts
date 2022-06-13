import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { Parachain2SubstrateBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<Parachain2SubstrateBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<Parachain2SubstrateBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
