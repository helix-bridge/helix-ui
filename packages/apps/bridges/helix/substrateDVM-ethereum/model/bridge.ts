import { ContractConfig, BridgeConfig } from 'shared/model';

interface SubstrateDVMEthereumContractConfig extends ContractConfig {
  guard: string;
}

export type SubstrateDVMEthereumBridgeConfig = Required<BridgeConfig<SubstrateDVMEthereumContractConfig>>;
