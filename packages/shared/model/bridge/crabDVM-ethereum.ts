import { ContractConfig, BridgeConfig } from 'shared/model';

interface CrabDVMEthereumContractConfig extends ContractConfig {
  stablecoinIssuing: string;
  stablecoinRedeem: string;
}

export type CrabDVMEthereumBridgeConfig = Required<BridgeConfig<CrabDVMEthereumContractConfig>>;
