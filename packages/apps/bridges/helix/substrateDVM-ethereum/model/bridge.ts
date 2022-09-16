import { ContractConfig, BridgeConfig } from 'shared/model';

type SubstrateDVMEthereumContractConfig = ContractConfig;

export type SubstrateDVMEthereumBridgeConfig = Required<BridgeConfig<SubstrateDVMEthereumContractConfig>>;
