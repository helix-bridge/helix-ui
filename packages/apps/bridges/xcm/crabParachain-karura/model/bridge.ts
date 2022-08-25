import { ContractConfig, BridgeConfig } from 'shared/model';

type CrabParachainKaruraContractConfig = ContractConfig;

export type CrabParachainKaruraBridgeConfig = Required<BridgeConfig<CrabParachainKaruraContractConfig>>;
