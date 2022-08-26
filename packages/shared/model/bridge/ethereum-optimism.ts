import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumOptimismContractConfig extends ContractConfig {
  stablecoinIssuing: string;
}

export type EthereumOptimismBridgeConfig = Required<BridgeConfig<EthereumOptimismContractConfig>>;
