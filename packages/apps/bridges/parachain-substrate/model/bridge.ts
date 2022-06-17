import { ContractConfig, BridgeConfig } from 'shared/model';

type ParachainSubstrateContractConfig = ContractConfig;

export type Parachain2SubstrateBridgeConfig = Required<BridgeConfig<ParachainSubstrateContractConfig>>;
