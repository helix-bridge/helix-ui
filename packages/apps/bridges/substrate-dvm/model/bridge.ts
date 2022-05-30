import { Api, ApiKeys, BridgeConfig, ContractConfig } from 'shared/model';

export type SubstrateDVMBridgeConfig = Required<Omit<BridgeConfig<ContractConfig, Api<ApiKeys>>, 'contracts'>>;
