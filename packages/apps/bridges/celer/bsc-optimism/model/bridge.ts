import { ContractConfig, BridgeConfig } from 'shared/model';

type BSCOptimismContractConfig = ContractConfig;

export type BSCOptimismBridgeConfig = Required<BridgeConfig<BSCOptimismContractConfig>>;
