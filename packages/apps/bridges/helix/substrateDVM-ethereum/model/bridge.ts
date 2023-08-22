import {
  BridgeConfig,
  ContractConfig,
  CrossToken,
  DVMChainConfig,
  EthereumChainConfig,
  EthereumExtension,
} from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

interface SubstrateDVMEthereumContractConfig extends ContractConfig {
  guard: string;
}

export type SubstrateDVMEthereumBridgeConfig = Required<BridgeConfig<SubstrateDVMEthereumContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateDVMEthereumBridgeConfig, DVMChainConfig, EthereumChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<EthereumChainConfig>,
  EthereumExtension
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateDVMEthereumBridgeConfig, DVMChainConfig, EthereumChainConfig>,
  CrossToken<EthereumChainConfig>,
  CrossToken<DVMChainConfig>,
  EthereumExtension
>;