import { ContractConfig, BridgeConfig } from 'shared/model';

type ArbitrumAstarContractConfig = ContractConfig;

export type ArbitrumAstarBridgeConfig = Required<BridgeConfig<ArbitrumAstarContractConfig>>;
