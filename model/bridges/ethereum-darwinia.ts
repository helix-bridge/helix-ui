import { Api, ApiKeys, BridgeConfig, ContractConfig, LockEventsStorage } from "../bridge";

interface EthereumDarwiniaContractConfig extends ContractConfig {
  ring: string; // e2d ring balance address
  kton: string; // e2d kton balance address
  fee: string; // e2d cross chain fee querying address
  redeemDeposit: string; // e2d redeem deposit address
}

export type EthereumDarwiniaBridgeConfig = Required<
  BridgeConfig<EthereumDarwiniaContractConfig, Pick<Api<ApiKeys>, 'dapp' | 'evolution'>>
> & {
  lockEvents: LockEventsStorage[];
};
