import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumArbitrumContractConfig extends ContractConfig {
  stablecoinIssuing: string;
}

export type EthereumArbitrumBridgeConfig = Required<BridgeConfig<EthereumArbitrumContractConfig>>;
