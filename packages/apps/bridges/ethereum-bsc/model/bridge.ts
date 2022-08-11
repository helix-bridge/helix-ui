import { ContractConfig, BridgeConfig } from 'shared/model';

type EthereumBSCContractConfig = ContractConfig;

export type EthereumBSCBridgeConfig = Required<BridgeConfig<EthereumBSCContractConfig>>;
