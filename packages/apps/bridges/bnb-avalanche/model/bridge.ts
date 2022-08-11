import { ContractConfig, BridgeConfig } from 'shared/model';

type BnbAvalancheContractConfig = ContractConfig;

export type BnbAvalancheBridgeConfig = Required<BridgeConfig<BnbAvalancheContractConfig>>;
