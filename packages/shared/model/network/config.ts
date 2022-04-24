import { AddEthereumChainParameter } from '../metamask';
import { EthereumTypeNetwork, Network, NetworkCategory, NetworkMode, PolkadotTypeNetwork } from './network';

export type LogoType = 'main' | 'minor' | 'assist';

export interface Logo {
  name: string;
  mode: NetworkMode;
  type: LogoType;
}

interface Token {
  name: string;
  type: 'native' | 'mapping';
  bridges: string[];
  precision: number;
  logo: string;
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

interface Social {
  github: string;
  portal: string;
  twitter: string;
}

export interface ChainConfig {
  isTest: boolean;
  logos: Logo[];
  name: Network;
  provider: ProviderConfig;
  social: Social;
  tokens: Token[];
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
