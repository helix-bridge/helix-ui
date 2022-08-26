import { ContractConfig, BridgeConfig } from 'shared/model';

type SubstrateSubstrateParachainContractConfig = ContractConfig;

export type SubstrateSubstrateParachainBridgeConfig = Required<BridgeConfig<SubstrateSubstrateParachainContractConfig>>;
