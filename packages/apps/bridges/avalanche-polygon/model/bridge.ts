import { ContractConfig, BridgeConfig } from 'shared/model';

type AvalanchePolygonContractConfig = ContractConfig;

export type AvalanchePolygonBridgeConfig = Required<BridgeConfig<AvalanchePolygonContractConfig>>;
