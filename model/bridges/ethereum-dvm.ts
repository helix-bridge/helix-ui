import { ContractConfig, BridgeConfig, Api, ApiKeys } from "../bridge/bridge";

/**
 * ethereum <-> crab dvm
 */
interface EthereumDVMContractConfig extends ContractConfig {
  proof: string;
}

export type EthereumDVMBridgeConfig = Required<
  BridgeConfig<EthereumDVMContractConfig, Pick<Api<ApiKeys>, 'dapp' | 'evolution'>>
>;
