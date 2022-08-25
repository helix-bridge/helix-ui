import { ContractConfig, BridgeConfig } from 'shared/model';

interface ArbitrumAstarContractConfig extends ContractConfig {
  stablecoinRedeem: string;
}

export type ArbitrumAstarBridgeConfig = Required<BridgeConfig<ArbitrumAstarContractConfig>>;
