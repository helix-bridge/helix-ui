import { ContractConfig, BridgeConfig } from 'shared/model';

type BSCArbitrumContractConfig = ContractConfig;

export type BSCArbitrumBridgeConfig = Required<BridgeConfig<BSCArbitrumContractConfig>>;
