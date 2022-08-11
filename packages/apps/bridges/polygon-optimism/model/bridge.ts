import { ContractConfig, BridgeConfig } from 'shared/model';

type PolygonOptimismContractConfig = ContractConfig;

export type PolygonOptimismBridgeConfig = Required<BridgeConfig<PolygonOptimismContractConfig>>;
