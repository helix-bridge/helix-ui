import { ContractConfig, BridgeConfig } from 'shared/model';

type BnbAstarContractConfig = ContractConfig;

export type BnbAstarBridgeConfig = Required<BridgeConfig<BnbAstarContractConfig>>;
