import { ContractConfig, BridgeConfig } from 'shared/model';

type EthereumAstarContractConfig = ContractConfig;

export type EthereumAstarBridgeConfig = Required<BridgeConfig<EthereumAstarContractConfig>>;
