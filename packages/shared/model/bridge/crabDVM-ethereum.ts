import { ContractConfig, BridgeConfig } from 'shared/model';

interface CrabDVMEthereumContractConfig extends ContractConfig {
  stablecoinBacking: string;
  stablecoinIssuing: string;
}

export type CrabDVMEthereumBridgeConfig = Required<BridgeConfig<CrabDVMEthereumContractConfig>>;
