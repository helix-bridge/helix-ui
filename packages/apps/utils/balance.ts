import BN from 'bn.js';
import { CrossChainDirection } from 'shared/model';
import { isKton, isRing } from 'shared/utils/helper/validator';
import { getDarwiniaBalance, getDVMBalance, getErc20Balance, getParachainBalance } from 'shared/utils/network/balance';
import {
  isCBridge,
  isCrabParachain2Moonriver,
  isCrabParachainKarura,
  isDarwinia2Ethereum,
  isDVM2Substrate,
  isEthereum2Darwinia,
  isEthereum2SubstrateDVM,
  isMoonriver2CrabParachain,
  isSubstrate2DVM,
  isSubstrate2SubstrateDVM,
  isSubstrate2SubstrateParachain,
  isSubstrateDVM2Ethereum,
  isSubstrateDVM2Substrate,
  isSubstrateDVMSubstrateDVM,
  isSubstrateParachain2Substrate,
} from './bridge';

function isDeposit({ from }: CrossChainDirection): boolean {
  const overview = from.cross.find((item) => item.partner.name === from.host);

  if (!overview) {
    throw new Error('Configuration item is wrong');
  }

  return overview.partner.role === 'issuing';
}

// eslint-disable-next-line complexity
export async function getBalance(direction: CrossChainDirection, account: string): Promise<BN[] | null> {
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

  if ([isDVM2Substrate, isSubstrateDVM2Ethereum].some((fn) => fn(fromChain, toChain))) {
    const kton = from.meta.tokens.find((item) => item.type === 'native' && isKton(item.symbol));

    return getDVMBalance(account, from.meta.provider, kton?.address);
  }

  if (
    [
      isSubstrateDVMSubstrateDVM,
      isSubstrateDVM2Substrate,
      isCBridge,
      isMoonriver2CrabParachain,
      isEthereum2SubstrateDVM,
    ].some((fn) => fn(fromChain, toChain))
  ) {
    if (direction.from.host === direction.to.host && isDeposit(direction)) {
      return getDVMBalance(account, from.meta.provider);
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
