import { ContractConfig, BridgeConfig } from 'shared/model';

interface PolygonAstarContractConfig extends ContractConfig {
  stablecoinRedeem: string;
}

export type PolygonAstarBridgeConfig = Required<BridgeConfig<PolygonAstarContractConfig>>;
