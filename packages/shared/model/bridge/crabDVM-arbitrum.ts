import { ContractConfig, BridgeConfig } from 'shared/model';

type CrabDVMArbitrumContractConfig = ContractConfig;

export type CrabDVMArbitrumBridgeConfig = Required<BridgeConfig<CrabDVMArbitrumContractConfig>>;
