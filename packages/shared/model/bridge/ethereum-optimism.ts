import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumOptimismContractConfig extends ContractConfig {
  stablecoinBacking: string;
}

export type EthereumOptimismBridgeConfig = Required<BridgeConfig<EthereumOptimismContractConfig>>;
