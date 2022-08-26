import { BridgeConfig, ContractConfig } from './bridge';

type SubstrateSubstrateParachainContractConfig = ContractConfig;

export type SubstrateSubstrateParachainBridgeConfig = Required<BridgeConfig<SubstrateSubstrateParachainContractConfig>>;
