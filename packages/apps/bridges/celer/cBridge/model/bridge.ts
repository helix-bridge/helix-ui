import { BridgeConfig, ContractConfig } from 'shared/model';

interface CBridgeContractConfig extends ContractConfig {
  stablecoinBacking?: string;
  stablecoinIssuing?: string;
}

export type CBridgeBridgeConfig = Required<BridgeConfig<CBridgeContractConfig>>;
