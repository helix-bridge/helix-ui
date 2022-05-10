import { Bridge, CrossChainPayload, CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { SubstrateSubstrateDVMBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateSubstrateDVMBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateSubstrateDVMBridgeConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<PolkadotChainConfig>
>;
