import { BridgeConfig, ContractConfig, LockEventsStorage } from 'shared/model';

interface EthereumDarwiniaContractConfig extends ContractConfig {
  fee: string; // e2d cross chain fee querying address
}

export type EthereumDarwiniaBridgeConfig = Required<BridgeConfig<EthereumDarwiniaContractConfig>> & {
  lockEvents: LockEventsStorage[];
};
