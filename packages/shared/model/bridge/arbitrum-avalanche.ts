import { ContractConfig, BridgeConfig } from 'shared/model';

type ArbitrumAvalancheContractConfig = ContractConfig;

export type ArbitrumAvalancheBridgeConfig = Required<BridgeConfig<ArbitrumAvalancheContractConfig>>;
