import { BridgeBase, CrossChainPayload, CrossToken, PolkadotChainConfig } from 'shared/model';
import { SubstrateSubstrateParachainBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  BridgeBase<SubstrateSubstrateParachainBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<PolkadotChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  BridgeBase<SubstrateSubstrateParachainBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<PolkadotChainConfig>
>;
