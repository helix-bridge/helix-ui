import { ContractConfig, BridgeConfig } from 'shared/model';

type CrabDVMEthereumContractConfig = ContractConfig;

export type CrabDVMEthereumBridgeConfig = Required<BridgeConfig<CrabDVMEthereumContractConfig>>;
