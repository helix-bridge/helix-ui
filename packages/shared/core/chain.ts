import { BN } from '@polkadot/util';
import {
  AddEthereumChainParameter,
  ChainConfig,
  DVMChainConfig,
  DVMNetwork,
  EthereumChainConfig,
  EthereumTypeNetwork,
  ParachainChainConfig,
  PolkadotChainConfig,
  PolkadotTypeNetwork,
} from '../model';
import { CrossChainDirection, TokenInfoWithMeta } from '../model/bridge';
import { Logo, ParachainEthereumCompatibleChainConfig, Social, TokenWithBridgesInfo } from '../model/network/config';
import { Network, ParachainEthereumCompatibleNetwork, SupportedWallet } from '../model/network/network';
import { isRing } from '../utils/helper/validator';
import {
  getDarwiniaBalance,
  getErc20Balance,
  getEthereumNativeBalance,
  getParachainBalance,
} from '../utils/network/balance';

export abstract class ChainBase implements ChainConfig {
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

export class PolkadotChain extends ChainBase implements PolkadotChainConfig {
  ss58Prefix: number;
  specVersion: number;
  name: PolkadotTypeNetwork;

  constructor(config: PolkadotChainConfig) {
    super(config);
    this.ss58Prefix = config.ss58Prefix;
    this.specVersion = config.specVersion;
    this.name = config.name;
  }

  async getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>,
    account: string
  ): Promise<BN[]> {
    const { from } = direction;
    const [ring, kton] = await getDarwiniaBalance(from.meta.provider, account);

    return isRing(from.symbol) ? [ring, ring] : [kton, ring];
  }
}

export class EthereumChain extends ChainBase implements EthereumChainConfig {
  ethereumChain: AddEthereumChainParameter;
  name: EthereumTypeNetwork;

  constructor(config: EthereumChainConfig) {
    super(config);
    this.ethereumChain = config.ethereumChain;
    this.name = config.name;
  }

  async getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>,
    account: string
  ): Promise<BN[]> {
    const { from } = direction;
    const tokenAddress = from.address;

    if (!tokenAddress) {
      return getEthereumNativeBalance(account, from.meta.provider).then((balance) => [balance]);
    } else {
      return Promise.all([
        getErc20Balance(tokenAddress, account, from.meta.provider),
        getEthereumNativeBalance(account, from.meta.provider),
      ]);
    }
  }
}

export class ParachainChain extends PolkadotChain implements ParachainChainConfig {
  paraId: number;

  constructor(config: ParachainChainConfig) {
    super(config);
    this.paraId = config.paraId;
  }

  async getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>,
    account: string
  ): Promise<BN[]> {
    const { from } = direction;
    const balance = await getParachainBalance(from, account);

    return [balance, balance];
  }
}

export class DVMChain extends EthereumChain implements DVMChainConfig {
  ethereumChain: AddEthereumChainParameter;
  name: DVMNetwork;
  ss58Prefix: number;
  specVersion: number;

  constructor(config: DVMChainConfig) {
    super(config);
    this.ethereumChain = config.ethereumChain;
    this.ss58Prefix = config.ss58Prefix;
    this.specVersion = config.specVersion;
    this.name = config.name;
  }

  async getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>,
    account: string
  ): Promise<BN[]> {
    const { from } = direction;
    const tokenAddress = from.address;
    const httpsProvider = from.meta.provider.replace('wss', 'https');

    if (from.type === 'native') {
      return getEthereumNativeBalance(account, httpsProvider).then((balance) => [balance, balance]);
    } else {
      return Promise.all([
        getErc20Balance(tokenAddress, account, httpsProvider),
        getEthereumNativeBalance(account, httpsProvider),
      ]);
    }
  }
}

export class ParachainEthereumCompatibleChain extends EthereumChain implements ParachainEthereumCompatibleChainConfig {
  ss58Prefix: number;
  specVersion: number;
  name: ParachainEthereumCompatibleNetwork;
  paraId: number;

  constructor(config: ParachainEthereumCompatibleChainConfig) {
    super(config);
    this.ss58Prefix = config.ss58Prefix;
    this.specVersion = config.specVersion;
    this.name = config.name;
    this.paraId = config.paraId;
  }
}
