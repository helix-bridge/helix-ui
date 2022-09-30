import { BridgeBase, CrossChainPayload, CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { SubstrateSubstrateDVMBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  BridgeBase<SubstrateSubstrateDVMBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  BridgeBase<SubstrateSubstrateDVMBridgeConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<PolkadotChainConfig>
>;
