import { ContractConfig, BridgeConfig } from 'shared/model';

type PolygonAstarContractConfig = ContractConfig;

export type PolygonAstarBridgeConfig = Required<BridgeConfig<PolygonAstarContractConfig>>;
