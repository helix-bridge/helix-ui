import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumArbitrumContractConfig extends ContractConfig {
  stablecoinBacking: string;
}

export type EthereumArbitrumBridgeConfig = Required<BridgeConfig<EthereumArbitrumContractConfig>>;
