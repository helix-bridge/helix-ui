import { BridgeConfig, ContractConfig, Api, ApiKeys } from "../bridge/bridge";

export type SubstrateSubstrateDVMBridgeConfig = Required<
  Omit<BridgeConfig<ContractConfig, Omit<Api<ApiKeys>, 'subscan' | 'subqlMMr'>>, 'contracts'>
>;
