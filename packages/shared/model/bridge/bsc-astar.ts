import { ContractConfig, BridgeConfig } from 'shared/model';

interface BSCAstarContractConfig extends ContractConfig {
  stablecoinIssuing: string;
}

export type BSCAstarBridgeConfig = Required<BridgeConfig<BSCAstarContractConfig>>;
