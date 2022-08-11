import { ContractConfig, BridgeConfig } from 'shared/model';

type AstarAvalancheContractConfig = ContractConfig;

export type AstarAvalancheBridgeConfig = Required<BridgeConfig<AstarAvalancheContractConfig>>;
