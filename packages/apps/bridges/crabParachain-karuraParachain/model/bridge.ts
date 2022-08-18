import { ContractConfig, BridgeConfig } from 'shared/model';

type CrabParachainKaruraParachainContractConfig = ContractConfig;

export type CrabParachainKaruraParachainBridgeConfig = Required<
  BridgeConfig<CrabParachainKaruraParachainContractConfig>
>;
