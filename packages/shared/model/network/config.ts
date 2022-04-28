import { AddEthereumChainParameter } from '../metamask';
import { Token } from '../token';
import { EthereumTypeNetwork, Network, NetworkCategory, NetworkMode, PolkadotTypeNetwork } from './network';

export type LogoType = 'main' | 'minor' | 'assist';

export interface Logo {
  name: string;
  type: LogoType;
}

export type TokenMode = 'native' | 'mapping';

export type AvailableBridgeCategory = 'helix';

type AvailableBridge = 'substrate-DVM' | 'substrate-substrateDVM' | 'ethereum-darwinia';

type PartnerRole = 'issuer' | 'receiver';

interface Partner {
  name: Network;
  mode: NetworkMode;
  symbol: string; // token symbol
  /**
   * partner role beyond to the issuing <-> redeem relationship;
   * e.g: On substrate to substrateDVM bridge, transform RING to xRING represent the issuing action, the opposite means redeem;
   * So we mark the substrate chain as issuer and the substrateDVM chain as receiver;
   */
  role: PartnerRole;
}
interface AvailableBridgeConfig {
  category: AvailableBridgeCategory;
  name: AvailableBridge;
  partner: Partner; //
}

export interface TokenInfo extends Token {
  type: TokenMode;
  bridges: AvailableBridgeConfig[];
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

interface Social {
  github: string;
  portal: string;
  twitter: string;
}

export interface ChainConfig {
  isTest: boolean;
  mode: NetworkMode;
  logos: Logo[];
  name: Network;
  provider: string;
  social: Social;
  tokens: TokenInfo[];
  category: NetworkCategory[]; // the first category decide the wallet connection: ethereum -> metamask, polkadot -> polkadot extension
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

export interface DVMChainConfig extends Omit<EthereumChainConfig, 'name'>, PolkadotChainConfig {
  dvm: DVMConfig;
}
