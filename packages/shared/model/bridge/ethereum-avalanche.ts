import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumAvalancheContractConfig extends ContractConfig {
  stablecoinIssuing: string;
}

export type EthereumAvalancheBridgeConfig = Required<BridgeConfig<EthereumAvalancheContractConfig>>;
