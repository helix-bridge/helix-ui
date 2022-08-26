import { ContractConfig, BridgeConfig } from 'shared/model';

interface AstarOptimismContractConfig extends ContractConfig {
  stablecoinBacking: string;
}

export type AstarOptimismBridgeConfig = Required<BridgeConfig<AstarOptimismContractConfig>>;
