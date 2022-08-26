import { ContractConfig, BridgeConfig } from 'shared/model';

interface CrabDVMAstarContractConfig extends ContractConfig {
  stablecoinBacking: string;
  stablecoinIssuing: string;
}

export type CrabDVMAstarBridgeConfig = Required<BridgeConfig<CrabDVMAstarContractConfig>>;
