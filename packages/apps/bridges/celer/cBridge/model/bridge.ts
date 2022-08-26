import { BridgeConfig, ContractConfig } from 'shared/model';

interface CBridgeContractConfig extends ContractConfig {
  stablecoinIssuing?: string;
  stablecoinRedeem?: string;
}

export type CBridgeBridgeConfig = Required<BridgeConfig<CBridgeContractConfig>>;
