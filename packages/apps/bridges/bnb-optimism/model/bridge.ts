import { ContractConfig, BridgeConfig } from 'shared/model';

type BnbOptimismContractConfig = ContractConfig;

export type BnbOptimismBridgeConfig = Required<BridgeConfig<BnbOptimismContractConfig>>;
