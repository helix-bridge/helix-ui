import {
  BridgeConfig,
  ContractConfig,
  CrossToken,
  DVMChainConfig,
  EthereumExtension,
  PolkadotChainConfig,
  PolkadotExtension,
} from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

export interface SubstrateSubstrateDVMContractConfig extends ContractConfig {
  genesis: '0x0000000000000000000000000000000000000000';
}

export type SubstrateSubstrateDVMBridgeConfig = Required<BridgeConfig<SubstrateSubstrateDVMContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateSubstrateDVMBridgeConfig, PolkadotChainConfig, DVMChainConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<DVMChainConfig>,
  PolkadotExtension
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateSubstrateDVMBridgeConfig, PolkadotChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<PolkadotChainConfig>,
  EthereumExtension
>;
