import { BridgeConfig, ContractConfig, Api, ApiKeys } from '../bridge/bridge';

export type SubstrateDVMBridgeConfig = Required<
  Omit<BridgeConfig<ContractConfig, Pick<Api<ApiKeys>, 'subql'>>, 'contracts'>
>;
