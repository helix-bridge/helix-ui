import { ContractConfig, BridgeConfig } from 'shared/model';

type HecoPolygonContractConfig = ContractConfig;

export type HecoPolygonBridgeConfig = Required<BridgeConfig<HecoPolygonContractConfig>>;
