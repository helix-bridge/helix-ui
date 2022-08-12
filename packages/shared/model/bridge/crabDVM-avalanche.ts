import { ContractConfig, BridgeConfig } from 'shared/model';

type CrabDVMAvalancheContractConfig = ContractConfig;

export type CrabDVMAvalancheBridgeConfig = Required<BridgeConfig<CrabDVMAvalancheContractConfig>>;
