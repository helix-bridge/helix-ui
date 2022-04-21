import { BridgeConfig, ContractConfig } from '../bridge/bridge';

export type SubstrateDVMBridgeConfig = Required<Omit<BridgeConfig<ContractConfig>, 'contracts' | 'api'>>;
