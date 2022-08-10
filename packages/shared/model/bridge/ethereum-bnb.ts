import { ContractConfig, BridgeConfig } from 'shared/model';

type EthereumBnbContractConfig = ContractConfig;

export type EthereumBnbBridgeConfig = Required<BridgeConfig<EthereumBnbContractConfig>>;
