import { BridgeConfig, ContractConfig } from './bridge';

type ParachainSubstrateContractConfig = ContractConfig;

export type ParachainSubstrateBridgeConfig = Required<BridgeConfig<ParachainSubstrateContractConfig>>;
