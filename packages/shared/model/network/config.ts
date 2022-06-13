import { AddEthereumChainParameter } from '../metamask';
import { Token } from '../token';
import { EthereumTypeNetwork, Network, NetworkMode, PolkadotTypeNetwork, SupportedWallet } from './network';

export type LogoType = 'main' | 'minor' | 'assist';

export interface Logo {
  name: string;
  type: LogoType;
}

export type TokenType = 'native' | 'mapping';

export type BridgeCategory = 'helix';

export type BridgeName = 'substrate-DVM' | 'substrate-substrateDVM' | 'ethereum-darwinia' | 'parachain-substrate';

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
interface CrossOverview {
  category: BridgeCategory;
  bridge: BridgeName;
  partner: Partner;
}

export interface TokenWithBridgesInfo extends Token {
  type: TokenType;
  cross: CrossOverview[];
  claim?: boolean;
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
  tokens: TokenWithBridgesInfo[];
  wallets: SupportedWallet[];
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

/**
 * TODO: Should omit the ss58Prefix and specVersion fields on PolkadotChainConfig?
 *
 * Better, fix the name field and then remove the mode field on ChainConfig;
 * ```ts
 * interface DVMChainConfig extends Omit<EthereumChainConfig, 'name'> {
 *    name: PolkadotTypeNetwork + '-dvm'
 * }
 * ```
 */
export interface DVMChainConfig extends Omit<EthereumChainConfig, 'name'>, PolkadotChainConfig {}
