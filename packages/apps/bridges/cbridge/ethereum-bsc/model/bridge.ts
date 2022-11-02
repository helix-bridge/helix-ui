import { ContractConfig, BridgeConfig } from 'shared/model';

interface EthereumBSCContractConfig extends ContractConfig {
  stablecoinBacking: string;
}

export type EthereumBSCBridgeConfig = Required<BridgeConfig<EthereumBSCContractConfig>>;
