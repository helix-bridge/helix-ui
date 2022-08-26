import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumPolygonContractConfig extends ContractConfig {
  stablecoinIssuing: string;
}

export type EthereumPolygonBridgeConfig = Required<BridgeConfig<EthereumPolygonContractConfig>>;
