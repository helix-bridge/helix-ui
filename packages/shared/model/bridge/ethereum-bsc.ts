import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumBSCContractConfig extends ContractConfig {
  stablecoinIssuing: string;
}

export type EthereumBSCBridgeConfig = Required<BridgeConfig<EthereumBSCContractConfig>>;
