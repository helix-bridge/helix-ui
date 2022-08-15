import { BridgeCategory, BridgeName } from '../bridge';
import { AddEthereumChainParameter } from '../metamask';
import { Token } from '../token';
import { DVMNetwork, EthereumTypeNetwork, Network, PolkadotTypeNetwork, SupportedWallet } from './network';

export type LogoType = 'main' | 'minor' | 'assist';

export interface Logo {
  name: string;
  type: LogoType;
}

export type TokenType = 'native' | 'mapping';

type PartnerRole = 'issuing' | 'backing';

interface Partner {
  name: Network;
  symbol: string;
  role: PartnerRole;
  claim?: boolean;
}

interface CrossOverview {
  category: BridgeCategory;
  bridge: BridgeName;
  partner: Partner;
}

export interface TokenWithBridgesInfo extends Token {
  type: TokenType;
  cross: CrossOverview[];
  host: Network;
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
  provider: string;
  social: Social;
  tokens: TokenWithBridgesInfo[];
  wallets: SupportedWallet[];
  fullName?: string;
}

export interface EthereumChainConfig extends ChainConfig {
  name: EthereumTypeNetwork;
  ethereumChain: AddEthereumChainParameter;
}

export interface PolkadotChainConfig extends ChainConfig {
  name: PolkadotTypeNetwork;
  ss58Prefix: number;
  specVersion: number;
}

export interface DVMChainConfig extends ChainConfig {
  name: DVMNetwork;
  ethereumChain: AddEthereumChainParameter;
  ss58Prefix: number;
  specVersion: number;
}
