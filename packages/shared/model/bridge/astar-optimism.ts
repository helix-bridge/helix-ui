import { ContractConfig, BridgeConfig } from 'shared/model';

interface AstarOptimismContractConfig extends ContractConfig {
  stablecoinIssuing: string;
}

export type AstarOptimismBridgeConfig = Required<BridgeConfig<AstarOptimismContractConfig>>;
