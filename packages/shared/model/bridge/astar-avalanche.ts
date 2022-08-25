import { ContractConfig, BridgeConfig } from 'shared/model';

interface AstarAvalancheContractConfig extends ContractConfig {
  stablecoinIssuing: string;
}

export type AstarAvalancheBridgeConfig = Required<BridgeConfig<AstarAvalancheContractConfig>>;
