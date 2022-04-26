import { BridgeConfig, ContractConfig, Api, ApiKeys } from '@helix/shared/model';

export type SubstrateSubstrateDVMBridgeConfig = Required<
  Omit<BridgeConfig<ContractConfig, Omit<Api<ApiKeys>, 'subscan' | 'subqlMMr'>>, 'contracts'>
>;
