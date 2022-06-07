import { Api, ApiKeys, BridgeConfig, ContractConfig, LockEventsStorage } from '../bridge';

interface EthereumDarwiniaContractConfig extends ContractConfig {
  fee: string; // e2d cross chain fee querying address
}

export type EthereumDarwiniaBridgeConfig = Required<
  BridgeConfig<EthereumDarwiniaContractConfig, Pick<Api<ApiKeys>, 'dapp'>>
> & {
  lockEvents: LockEventsStorage[];
};
