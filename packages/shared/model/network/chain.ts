import { BN } from '@polkadot/util';
import {
  getDarwiniaBalance,
  getErc20Balance,
  getEthereumNativeBalance,
  getParachainBalance,
} from '../../utils/network/balance';
import { CrossChainDirection, TokenInfoWithMeta } from '../bridge';
import { ChainConfig } from './config';

export abstract class Chain {
  abstract getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>,
    account: string
  ): Promise<BN[]>;
}

export class PolkadotChain extends Chain {
  getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta<ChainConfig>, TokenInfoWithMeta<ChainConfig>>,
    account: string
  ): Promise<BN[]> {
    const { from } = direction;

    return getDarwiniaBalance(from.meta.provider, account);
  }
}

export class EthereumChain extends Chain {
  getBalance(
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

export class ParachainChain extends Chain {
  getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta<ChainConfig>, TokenInfoWithMeta<ChainConfig>>,
    account: string
  ): Promise<BN[]> {
    const { from } = direction;

    return getParachainBalance(from, account).then((balance) => [balance]);
  }
}
