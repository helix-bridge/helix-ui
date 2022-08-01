import { ContractConfig, BridgeConfig } from 'shared/model';

type EthereumHecoContractConfig = ContractConfig;

export type EthereumHecoBridgeConfig = Required<BridgeConfig<EthereumHecoContractConfig>>;
