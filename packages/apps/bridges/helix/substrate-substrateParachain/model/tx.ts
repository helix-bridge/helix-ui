import { Bridge, CrossChainPayload, CrossToken, PolkadotChainConfig } from 'shared/model';
import { SubstrateSubstrateParachainBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateSubstrateParachainBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<PolkadotChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateSubstrateParachainBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<PolkadotChainConfig>
>;
