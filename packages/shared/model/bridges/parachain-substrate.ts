import { BridgeConfig, ContractConfig } from '../bridge/bridge';

type ParachainSubstrateContractConfig = ContractConfig;

export type ParachainSubstrateBridgeConfig = Required<BridgeConfig<ParachainSubstrateContractConfig>>;
