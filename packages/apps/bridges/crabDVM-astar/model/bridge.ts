import { ContractConfig, BridgeConfig } from 'shared/model';

type CrabDVMAstarContractConfig = ContractConfig;

export type CrabDVMAstarBridgeConfig = Required<BridgeConfig<CrabDVMAstarContractConfig>>;
