import BN from 'bn.js';
import { CrossChainDirection } from 'shared/model';
import {
  isCBridge,
  isCrabParachain2Moonriver,
  isCrabParachainKarura,
  isDarwinia2Ethereum,
  isDVM2Substrate,
  isEthereum2Darwinia,
  isMoonriver2CrabParachain,
  isSubstrateParachain2Substrate,
  isSubstrate2DVM,
  isSubstrate2SubstrateParachain,
  isSubstrate2SubstrateDVM,
  isSubstrateDVM2Substrate,
  isSubstrateDVMSubstrateDVM,
} from 'shared/utils/bridge';
import { isKton, isRing } from 'shared/utils/helper';
import { getDarwiniaBalance, getDVMBalance, getErc20Balance, getParachainBalance } from 'shared/utils/network/balance';

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
        .map((item) => getErc20Balance(item.address, account))
    );

    return [ring, kton];
  }

  if (isDVM2Substrate(fromChain, toChain)) {
    const kton = from.meta.tokens.find((item) => item.type === 'native' && isKton(item.symbol));

    return getDVMBalance(account, kton?.address);
  }

  if (
    [isSubstrateDVMSubstrateDVM, isSubstrateDVM2Substrate, isCBridge, isMoonriver2CrabParachain].some((fn) =>
      fn(fromChain, toChain)
    )
  ) {
    if (direction.from.host === direction.to.host && isDeposit(direction)) {
      return getDVMBalance(account);
    }

    return getErc20Balance(from.address, account).then((res) => [res]);
  }

  if (
    [isSubstrateParachain2Substrate, isCrabParachainKarura, isCrabParachain2Moonriver].some((fn) =>
      fn(fromChain, toChain)
    )
  ) {
    return getParachainBalance(from, account).then((res) => [res]);
  }

  console.warn(`🚨 Can not find a method to fetch balance of ${from.symbol} for ${fromChain} to ${toChain} transfer `);

  return null;
}
