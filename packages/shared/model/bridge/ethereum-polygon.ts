import { ContractConfig, BridgeConfig } from 'shared/model';

type EthereumPolygonContractConfig = ContractConfig;

export type EthereumPolygonBridgeConfig = Required<BridgeConfig<EthereumPolygonContractConfig>>;
