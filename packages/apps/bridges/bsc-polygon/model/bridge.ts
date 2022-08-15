import { ContractConfig, BridgeConfig } from 'shared/model';

type BSCPolygonContractConfig = ContractConfig;

export type BSCPolygonBridgeConfig = Required<BridgeConfig<BSCPolygonContractConfig>>;
