import BN from 'bn.js';
import { CrossChainDirection } from 'shared/model';
import {
  isCBridge,
  isCrabParachainKaruraParachain,
  isDarwinia2Ethereum,
  isDVM2Substrate,
  isEthereum2Darwinia,
  isParachain2Substrate,
  isSubstrate2DVM,
  isSubstrate2Parachain,
  isSubstrate2SubstrateDVM,
  isSubstrateDVM2Substrate,
} from 'shared/utils/bridge';
import { isKton, isRing } from 'shared/utils/helper';
import { getDarwiniaBalance, getDVMBalance, getErc20Balance, getParachainBalance } from 'shared/utils/network/balance';

// eslint-disable-next-line complexity
export async function getBalance(direction: CrossChainDirection, account: string): Promise<BN[] | null> {
  const { from, to } = direction;
  const fromChain = from.meta.name;
  const toChain = to.meta.name;

  if (!account) {
    return null;
  }

  if (
    [isDarwinia2Ethereum, isSubstrate2DVM, isSubstrate2SubstrateDVM, isSubstrate2Parachain].some((fn) =>
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

  if ([isSubstrateDVM2Substrate, isCBridge].some((fn) => fn(fromChain, toChain))) {
    return getErc20Balance(from.address, account).then((res) => [res]);
  }

  if ([isParachain2Substrate, isCrabParachainKaruraParachain].some((fn) => fn(fromChain, toChain))) {
    return getParachainBalance(from.meta.provider, account).then((res) => [res]);
  }

  console.warn(`🚨 Can not find a method to fetch balance of ${from.symbol} for ${fromChain} to ${toChain} transfer `);

  return null;
}
