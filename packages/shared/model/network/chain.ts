import { BN } from '@polkadot/util';
import { ChainConfig } from '..';
import { CrossChainDirection, TokenInfoWithMeta } from '../bridge';
import { Logo, Social, TokenWithBridgesInfo } from './config';
import { Network, SupportedWallet } from './network';

export abstract class Chain implements ChainConfig {
  isTest: boolean;
  logos: Logo[];
  name: Network;
  provider: string;
  social: Social;
  tokens: TokenWithBridgesInfo[];
  wallets: SupportedWallet[];
  fullName?: string | undefined;

  constructor(config: ChainConfig) {
    this.isTest = config.isTest;
    this.logos = config.logos;
    this.name = config.name;
    this.provider = config.provider;
    this.social = config.social;
    this.tokens = config.tokens;
    this.wallets = config.wallets;
    this.fullName = config.fullName;
  }

  abstract getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>,
    account: string
  ): Promise<BN[]>;
}
