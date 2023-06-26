import { BridgeConfig, ContractConfig, CrossToken, EthereumChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type LnBridgeContractConfig = ContractConfig;

export type LnBridgeBridgeConfig = Required<BridgeConfig<LnBridgeContractConfig>>;

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
