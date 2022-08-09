import { ContractConfig, BridgeConfig } from 'shared/model';

type BnbArbitrumContractConfig = ContractConfig;

export type BnbArbitrumBridgeConfig = Required<BridgeConfig<BnbArbitrumContractConfig>>;
