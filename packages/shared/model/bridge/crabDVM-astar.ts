import { ContractConfig, BridgeConfig } from 'shared/model';

interface CrabDVMAstarContractConfig extends ContractConfig {
  stablecoinIssuing: string;
  stablecoinRedeem: string;
}

export type CrabDVMAstarBridgeConfig = Required<BridgeConfig<CrabDVMAstarContractConfig>>;
