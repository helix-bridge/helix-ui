import { BN } from '@polkadot/util';
import {
  knownDVMNetworks,
  knownEthereumNetworks,
  knownParachainNetworks,
  knownPolkadotNetworks,
} from 'shared/config/network';
import {
  AddEthereumChainParameter,
  ChainConfig,
  CrossChainDirection,
  DVMChainConfig,
  DVMNetwork,
  EthereumChainConfig,
  EthereumTypeNetwork,
  Network,
  ParachainChainConfig,
  PolkadotChainConfig,
  PolkadotTypeNetwork,
  TokenInfoWithMeta,
} from 'shared/model';
import { Chain } from '../../model/network/chain';
import { getDarwiniaBalance, getErc20Balance, getEthereumNativeBalance, getParachainBalance } from './balance';

const isSpecifyNetwork = (known: Network[]) => (network: ChainConfig | Network | null | undefined) => {
  if (!network) {
    return false;
  }

  return known.some((item) => item === network || item === (network as ChainConfig)?.name);
};

export const isPolkadotNetwork = isSpecifyNetwork(knownPolkadotNetworks);

export const isDVMNetwork = isSpecifyNetwork(knownDVMNetworks);

export const isEthereumNetwork = isSpecifyNetwork(knownEthereumNetworks);

export const isParachainNetwork = isSpecifyNetwork(knownParachainNetworks);

export class PolkadotChain extends Chain implements PolkadotChainConfig {
  ss58Prefix: number;
  specVersion: number;
  name: PolkadotTypeNetwork;

  constructor(config: PolkadotChainConfig) {
    super(config);
    this.ss58Prefix = config.ss58Prefix;
    this.specVersion = config.specVersion;
  }

  getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta<ChainConfig>, TokenInfoWithMeta<ChainConfig>>,
    account: string
  ): Promise<BN[]> {
    const { from } = direction;

    return getDarwiniaBalance(from.meta.provider, account);
  }
}

export class EthereumChain extends Chain implements EthereumChainConfig {
  ethereumChain: AddEthereumChainParameter;
  name: EthereumTypeNetwork;

  constructor(config: EthereumChainConfig) {
    super(config);
    this.ethereumChain = config.ethereumChain;
  }

  async getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta<ChainConfig>, TokenInfoWithMeta<ChainConfig>>,
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
    direction: CrossChainDirection<TokenInfoWithMeta<ChainConfig>, TokenInfoWithMeta<ChainConfig>>,
    account: string
  ): Promise<BN[]> {
    const { from } = direction;

    return getParachainBalance(from, account).then((balance) => [balance]);
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
  }

  async getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta<ChainConfig>, TokenInfoWithMeta<ChainConfig>>,
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
