import { ContractConfig, BridgeConfig } from 'shared/model';

interface ArbitrumAstarContractConfig extends ContractConfig {
  stablecoinIssuing: string;
}

export type ArbitrumAstarBridgeConfig = Required<BridgeConfig<ArbitrumAstarContractConfig>>;
