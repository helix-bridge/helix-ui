import { ContractConfig, BridgeConfig } from 'shared/model';

type CrabDVMBscContractConfig = ContractConfig;

export type CrabDVMBscBridgeConfig = Required<BridgeConfig<CrabDVMBscContractConfig>>;
