import { BridgeConfig, ContractConfig } from 'shared/model';

export interface SubstrateSubstrateDVMContractConfig extends ContractConfig {
  genesis: '0x0000000000000000000000000000000000000000';
}

export type SubstrateSubstrateDVMBridgeConfig = Required<BridgeConfig<SubstrateSubstrateDVMContractConfig>>;
