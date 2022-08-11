import { ContractConfig, BridgeConfig } from 'shared/model';

type ArbitrumOptimismContractConfig = ContractConfig;

export type ArbitrumOptimismBridgeConfig = Required<BridgeConfig<ArbitrumOptimismContractConfig>>;
