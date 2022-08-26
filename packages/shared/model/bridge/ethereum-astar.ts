import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumAstarContractConfig extends ContractConfig {
  stablecoinRedeem: string;
  stablecoinIssuing: string;
}

export type EthereumAstarBridgeConfig = Required<BridgeConfig<EthereumAstarContractConfig>>;
