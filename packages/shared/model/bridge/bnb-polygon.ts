import { ContractConfig, BridgeConfig } from 'shared/model';

type BnbPolygonContractConfig = ContractConfig;

export type BnbPolygonBridgeConfig = Required<BridgeConfig<BnbPolygonContractConfig>>;
