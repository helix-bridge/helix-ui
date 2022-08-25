import { ContractConfig, BridgeConfig } from 'shared/model';

interface BSCAstarContractConfig extends ContractConfig {
  stablecoinRedeem: string;
}

export type BSCAstarBridgeConfig = Required<BridgeConfig<BSCAstarContractConfig>>;
