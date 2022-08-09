import { ContractConfig, BridgeConfig } from 'shared/model';

type CrabDVMHecoContractConfig = ContractConfig;

export type CrabDVMHecoBridgeConfig = Required<BridgeConfig<CrabDVMHecoContractConfig>>;
