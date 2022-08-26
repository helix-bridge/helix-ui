import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumAvalancheContractConfig extends ContractConfig {
  stablecoinBacking: string;
}

export type EthereumAvalancheBridgeConfig = Required<BridgeConfig<EthereumAvalancheContractConfig>>;
