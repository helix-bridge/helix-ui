import { ContractConfig, BridgeConfig } from 'shared/model';

type EthereumAvalancheContractConfig = ContractConfig;

export type EthereumAvalancheBridgeConfig = Required<BridgeConfig<EthereumAvalancheContractConfig>>;
