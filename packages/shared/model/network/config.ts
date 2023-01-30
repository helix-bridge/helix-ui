import { BridgeCategory, BridgeName } from '../bridge';
import { AddEthereumChainParameter } from '../metamask';
import { Token } from '../token';
import {
  DVMNetwork,
  EthereumTypeNetwork,
  Network,
  ParachainEthereumCompatibleNetwork,
  PolkadotTypeNetwork,
  SupportedWallet,
} from './network';

export type LogoType = 'main' | 'minor' | 'assist';

export interface Logo {
  name: string;
  type: LogoType;
}

export type TokenType = 'native' | 'erc20' | 'mapping';

type PartnerRole = 'issuing' | 'backing';

interface Partner {
  name: Network;
  symbol: string;
  role: PartnerRole;
  claim?: boolean;
}

export interface CrossOverview {
  category: BridgeCategory;
  bridge: BridgeName;
  partner: Partner;
  deprecated?: boolean;
  basefee?: number; // not include decimals
}

export interface TokenWithBridgesInfo extends Token {
  type: TokenType;
  cross: CrossOverview[];
  host: Network;
}

export interface Social {
  github: string;
  portal: string;
  twitter: string;
}

export interface Provider {
  https: string;
  wss: string;
}

export interface ChainConfig {
  isTest: boolean;
  logos: Logo[];
  name: Network;
  provider: Provider;
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

export interface DVMChainConfig extends EthereumChainConfig {
  name: DVMNetwork;
  ss58Prefix: number;
  specVersion: number;
}

export interface ParachainChainConfig extends PolkadotChainConfig {
  paraId: number;
}

export interface ParachainEthereumCompatibleChainConfig
  extends Omit<ParachainChainConfig, 'name'>,
    EthereumChainConfig {
  name: ParachainEthereumCompatibleNetwork;
}
