import { Api, ApiKeys, BridgeConfig, ContractConfig } from '@helix/shared/model';

export type SubstrateDVMBridgeConfig = Required<Omit<BridgeConfig<ContractConfig, Api<ApiKeys>>, 'contracts'>>;
