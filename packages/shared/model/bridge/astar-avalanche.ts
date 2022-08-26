import { ContractConfig, BridgeConfig } from 'shared/model';

interface AstarAvalancheContractConfig extends ContractConfig {
  stablecoinBacking: string;
}

export type AstarAvalancheBridgeConfig = Required<BridgeConfig<AstarAvalancheContractConfig>>;
