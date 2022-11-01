import { ContractConfig, BridgeConfig } from 'shared/model';

type AvalancheOptimismContractConfig = ContractConfig;

export type AvalancheOptimismBridgeConfig = Required<BridgeConfig<AvalancheOptimismContractConfig>>;
