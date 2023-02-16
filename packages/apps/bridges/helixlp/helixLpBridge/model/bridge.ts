import { BridgeConfig, ContractConfig, CrossToken, EthereumChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type HelixLpBridgeContractConfig = ContractConfig;

export type HelixLpBridgeBridgeConfig = Required<BridgeConfig<HelixLpBridgeContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<BridgeConfig, EthereumChainConfig, EthereumChainConfig>,
  CrossToken<EthereumChainConfig>,
  CrossToken<EthereumChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<BridgeConfig, EthereumChainConfig, EthereumChainConfig>,
  CrossToken<EthereumChainConfig>,
  CrossToken<EthereumChainConfig>
>;
