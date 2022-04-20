import { Api, ApiKeys, BridgeConfig } from '../bridge/bridge';

interface SubstrateSubstrateDVMContractConfig {
  issuing: string; // issuing:  receiver;  redeem: sender;
  redeem: string; // issuing: sender; redeem: recipient;
  genesis: '0x0000000000000000000000000000000000000000';
}

export type SubstrateSubstrateDVMBridgeConfig = Required<
  BridgeConfig<SubstrateSubstrateDVMContractConfig, Omit<Api<ApiKeys>, 'subscan' | 'subqlMMr'>>
>;
