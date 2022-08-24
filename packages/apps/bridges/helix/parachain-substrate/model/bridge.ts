import { ContractConfig, BridgeConfig } from 'shared/model';

type ParachainSubstrateContractConfig = ContractConfig;

export type ParachainSubstrateBridgeConfig = Required<BridgeConfig<ParachainSubstrateContractConfig>>;
