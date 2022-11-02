import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumAstarContractConfig extends ContractConfig {
  stablecoinIssuing: string;
  stablecoinBacking: string;
}

export type EthereumAstarBridgeConfig = Required<BridgeConfig<EthereumAstarContractConfig>>;
