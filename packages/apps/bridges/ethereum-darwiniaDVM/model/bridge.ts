import { Api, ApiKeys, BridgeConfig, ContractConfig } from '@helix/shared/model';

/**
 * ethereum <-> crab dvm
 */
interface EthereumDVMContractConfig extends ContractConfig {
  proof: string;
}

export type EthereumDVMBridgeConfig = Required<
  BridgeConfig<EthereumDVMContractConfig, Pick<Api<ApiKeys>, 'dapp' | 'evolution'>>
>;
