import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumAstarContractConfig extends ContractConfig {
  stablecoinRedeem: string;
}

export type EthereumAstarBridgeConfig = Required<BridgeConfig<EthereumAstarContractConfig>>;
