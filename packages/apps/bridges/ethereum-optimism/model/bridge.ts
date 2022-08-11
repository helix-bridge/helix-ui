import { ContractConfig, BridgeConfig } from 'shared/model';

type EthereumOptimismContractConfig = ContractConfig;

export type EthereumOptimismBridgeConfig = Required<BridgeConfig<EthereumOptimismContractConfig>>;
