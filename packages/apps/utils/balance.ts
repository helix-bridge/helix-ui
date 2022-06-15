import BN from 'bn.js';
import { CrossChainDirection } from 'shared/model';
import {
  isDarwinia2Ethereum,
  isDVM2Substrate,
  isEthereum2Darwinia,
  isSubstrate2DVM,
  isSubstrate2SubstrateDVM,
  isSubstrateDVM2Substrate,
} from 'shared/utils/bridge';
import { isKton, isRing } from 'shared/utils/helper';
import { getDarwiniaBalance, getDVMBalance, getErc20Balance } from 'shared/utils/network/balance';

// eslint-disable-next-line complexity
export async function getBalance(direction: CrossChainDirection, account: string): Promise<BN[] | BN | null> {
  const { from, to } = direction;

  if (isEthereum2Darwinia(from.meta.name, to.meta.name)) {
    const [ring, kton] = await Promise.all(
      from.meta.tokens
        .filter((item) => isRing(item.symbol) || isKton(item.symbol))
        .sort((cur) => (isRing(cur.symbol) ? -1 : 1))
        .map((item) => getErc20Balance(item.address, account, false))
    );

    return [ring, kton];
  }

  if (isDarwinia2Ethereum(from.meta.name, to.meta.name)) {
    return getDarwiniaBalance(from.meta.provider, account);
  }

  if (isSubstrate2DVM(from.meta.name, to.meta.name)) {
    return getDarwiniaBalance(from.meta.provider, account);
  }

  if (isDVM2Substrate(from.meta.name, to.meta.name)) {
    const kton = from.meta.tokens.find((item) => item.type === 'native' && isKton(item.symbol))!;

    return getDVMBalance(kton.address, account);
  }

  if (isSubstrate2SubstrateDVM(from.meta.name, to.meta.name)) {
    return getDarwiniaBalance(from.meta.provider, account);
  }

  if (isSubstrateDVM2Substrate(from.meta.name, to.meta.name)) {
    return getErc20Balance(from.address, account, false);
  }

  return null;
}
