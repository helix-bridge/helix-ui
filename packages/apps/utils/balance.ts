import BN from 'bn.js';
import { CrossChainDirection, TokenInfoWithMeta } from 'shared/model';
import { isKton, isRing } from 'shared/utils/helper/validator';
import {
  getDarwiniaBalance,
  getErc20Balance,
  getEthereumNativeBalance,
  getParachainBalance,
} from 'shared/utils/network/balance';
import {
  isCBridge,
  isCrabParachain2Moonriver,
  isCrabParachainKarura,
  isDarwinia2Ethereum,
  isDVM2Substrate,
  isEthereum2Darwinia,
  isMoonriver2CrabParachain,
  isSubstrate2DVM,
  isSubstrate2SubstrateDVM,
  isSubstrate2SubstrateParachain,
  isSubstrateDVM2Substrate,
  isSubstrateDVMEthereum,
  isSubstrateDVMSubstrateDVM,
  isSubstrateParachain2Substrate,
} from './bridge';

function isDeposit({ from }: CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>): boolean {
  const overview = from.cross.find((item) => item.partner.name === from.host);

  if (!overview) {
    throw new Error('Configuration item is wrong');
  }

  return overview.partner.role === 'issuing';
}

// eslint-disable-next-line complexity
export async function getBalance(
  direction: CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>,
  account: string
): Promise<BN[] | null> {
  const { from, to } = direction;
  const fromChain = from.meta.name;
  const toChain = to.meta.name;

  if (!account) {
    return null;
  }

  if (
    [isDarwinia2Ethereum, isSubstrate2DVM, isSubstrate2SubstrateDVM, isSubstrate2SubstrateParachain].some((fn) =>
      fn(fromChain, toChain)
    )
  ) {
    return getDarwiniaBalance(from.meta.provider, account);
  }

  if (isEthereum2Darwinia(fromChain, toChain)) {
    const [ring, kton] = await Promise.all(
      from.meta.tokens
        .filter((item) => isRing(item.symbol) || isKton(item.symbol))
        .sort((cur) => (isRing(cur.symbol) ? -1 : 1))
        .map((item) => getErc20Balance(item.address, account, from.meta.provider))
    );

    return [ring, kton];
  }

  if (isDVM2Substrate(fromChain, toChain)) {
    const kton = from.meta.tokens.find((item) => item.type === 'native' && isKton(item.symbol))!;

    return Promise.all([
      getErc20Balance(kton.address, account, from.meta.provider),
      getEthereumNativeBalance(account, from.meta.provider),
    ]);
  }

  if (isSubstrateDVMEthereum(fromChain, toChain)) {
    if (from.type === 'native') {
      return getEthereumNativeBalance(account, from.meta.provider).then((res) => [res, res]);
    } else {
      return Promise.all([
        getErc20Balance(from.address, account, from.meta.provider),
        getEthereumNativeBalance(account, from.meta.provider),
      ]);
    }
  }

  if (isSubstrateDVMSubstrateDVM(fromChain, toChain)) {
    return Promise.all([
      getErc20Balance(from.address, account, from.meta.provider),
      getEthereumNativeBalance(account, from.meta.provider),
    ]);
  }

  if ([isSubstrateDVM2Substrate, isCBridge, isMoonriver2CrabParachain].some((fn) => fn(fromChain, toChain))) {
    if (direction.from.host === direction.to.host && isDeposit(direction)) {
      return getEthereumNativeBalance(account, from.meta.provider).then((res) => [res, res]);
    }

    return getErc20Balance(from.address, account, from.meta.provider).then((res) => [res]);
  }

  if (
    [isSubstrateParachain2Substrate, isCrabParachainKarura, isCrabParachain2Moonriver].some((fn) =>
      fn(fromChain, toChain)
    )
  ) {
    return getParachainBalance(from, account).then((res) => [res]);
  }

  return null;
}
