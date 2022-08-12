import { ContractConfig, BridgeConfig } from 'shared/model';

type CrabDVMOptimismContractConfig = ContractConfig;

export type CrabDVMOptimismBridgeConfig = Required<BridgeConfig<CrabDVMOptimismContractConfig>>;
