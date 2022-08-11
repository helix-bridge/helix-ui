import { ContractConfig, BridgeConfig } from 'shared/model';

type AstarOptimismContractConfig = ContractConfig;

export type AstarOptimismBridgeConfig = Required<BridgeConfig<AstarOptimismContractConfig>>;
