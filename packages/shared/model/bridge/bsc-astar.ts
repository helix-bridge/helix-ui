import { ContractConfig, BridgeConfig } from 'shared/model';

type BSCAstarContractConfig = ContractConfig;

export type BSCAstarBridgeConfig = Required<BridgeConfig<BSCAstarContractConfig>>;
