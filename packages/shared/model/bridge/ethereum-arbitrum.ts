import { ContractConfig, BridgeConfig } from 'shared/model';

type EthereumArbitrumContractConfig = ContractConfig;

export type EthereumArbitrumBridgeConfig = Required<BridgeConfig<EthereumArbitrumContractConfig>>;
