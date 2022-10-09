import { CrossChainPayload, CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { Bridge } from '../../../../model/bridge';
import { SubstrateSubstrateDVMBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateSubstrateDVMBridgeConfig, PolkadotChainConfig, DVMChainConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateSubstrateDVMBridgeConfig, PolkadotChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<PolkadotChainConfig>
>;
