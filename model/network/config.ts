import { AddEthereumChainParameter } from '../metamask';
import { EthereumTypeNetwork, Network, NetworkCategory, PolkadotTypeNetwork } from './network';

export interface Facade {
  logo: string;
  logoMinor: string;
  logoWithText: string;
  logoAssist?: string;
  logoAssist2?: string;
}

interface DVMConfig {
  ring: string;
  kton: string;
  smartKton: string;
  smartRing: string;
  smartWithdrawRing: string;
  smartWithdrawKton: string;
  [key: string]: string;
}

interface ProviderConfig {
  rpc: string;
  etherscan: string;
}

export interface ChainConfig {
  facade: Facade;
  isTest: boolean;
  name: Network;
  provider: ProviderConfig;
  type: NetworkCategory[];
}

export interface EthereumChainConfig extends ChainConfig {
  name: EthereumTypeNetwork;
  ethereumChain: AddEthereumChainParameter;
}

export interface PolkadotChainConfig extends ChainConfig {
  name: PolkadotTypeNetwork;
  ss58Prefix: number;
  specVersion: number;
  endpoints: {
    mmr: string;
  };
}

export interface DVMChainConfig extends Omit<EthereumChainConfig, 'name'>, PolkadotChainConfig {
  dvm: DVMConfig;
}
