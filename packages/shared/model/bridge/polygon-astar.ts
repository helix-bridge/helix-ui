import { ContractConfig, BridgeConfig } from 'shared/model';

interface PolygonAstarContractConfig extends ContractConfig {
  stableRedeem: string;
}

export type PolygonAstarBridgeConfig = Required<BridgeConfig<PolygonAstarContractConfig>>;
