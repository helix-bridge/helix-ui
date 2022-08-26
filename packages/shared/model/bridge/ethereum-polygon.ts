import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumPolygonContractConfig extends ContractConfig {
  stablecoinBacking: string;
}

export type EthereumPolygonBridgeConfig = Required<BridgeConfig<EthereumPolygonContractConfig>>;
