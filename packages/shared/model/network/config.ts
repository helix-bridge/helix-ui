import { AddEthereumChainParameter } from '../metamask';
import { Token } from '../token';
import { EthereumTypeNetwork, Network, NetworkCategory, NetworkMode, PolkadotTypeNetwork } from './network';

export type LogoType = 'main' | 'minor' | 'assist';

export interface Logo {
  name: string;
  mode: NetworkMode;
  type: LogoType;
}

export type TokenMode = 'native' | 'mapping';

export interface TokenInfo extends Token {
  type: TokenMode;
  bridges: string[];
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
  tokens: TokenInfo[];
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
