import { ContractConfig, BridgeConfig } from 'shared/model';

type ArbitrumPolygonContractConfig = ContractConfig;

export type ArbitrumPolygonBridgeConfig = Required<BridgeConfig<ArbitrumPolygonContractConfig>>;
