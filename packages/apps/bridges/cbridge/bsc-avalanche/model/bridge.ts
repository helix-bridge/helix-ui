import { ContractConfig, BridgeConfig } from 'shared/model';

type BSCAvalancheContractConfig = ContractConfig;

export type BSCAvalancheBridgeConfig = Required<BridgeConfig<BSCAvalancheContractConfig>>;
