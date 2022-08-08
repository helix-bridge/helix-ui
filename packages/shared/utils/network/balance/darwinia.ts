import { AccountInfo } from '@darwinia/types';
import '@polkadot/api-augment';
import { PalletBalancesBalanceLock } from '@polkadot/types/lookup';
import { BN, bnMax, BN_ZERO } from '@polkadot/util';
import { entrance, waitUntilConnected } from '../../connection';

// eslint-disable-next-line complexity, @typescript-eslint/no-explicit-any
const calcMax = (lockItem: any, current: BN) => {
  let max = current;

  if (lockItem.reasons && !lockItem.reasons.isFee) {
    max = bnMax(lockItem.amount, max);
  } else if (lockItem.lockReasons && !lockItem.lockReasons.isFee) {
    if (lockItem.lockFor.isCommon) {
      max = bnMax(lockItem.lockFor.asCommon.amount, max);
    } else if (lockItem.lockFor.isStaking) {
      max = bnMax(lockItem.lockFor.asStaking.stakingAmount, max);
    }
  }

  return max;
};

/**
 * @description other api can get balances:  api.derive.balances.all, api.query.system.account;
 * @see https://github.com/darwinia-network/wormhole-ui/issues/142
 */
// eslint-disable-next-line complexity
export async function getBalance(provider: string, account: string): Promise<[BN, BN]> {
  const api = entrance.polkadot.getInstance(provider);

  await waitUntilConnected(api);

  try {
    const {
      data: { free, freeKton },
    } = await api.query.system.account<AccountInfo>(account);

    const locks = await api.query.balances.locks<PalletBalancesBalanceLock[]>(account);
    const ktonLocks = (await api.query.kton?.locks<PalletBalancesBalanceLock[]>(account)) ?? [];

    let maxLock = BN_ZERO;
    let maxKtonLock = BN_ZERO;

    locks.forEach((item) => {
      maxLock = calcMax(item, maxLock);
    });

    ktonLocks.forEach((item) => {
      maxKtonLock = calcMax(item, maxKtonLock);
    });

    const ring = free.sub(maxLock);
    const kton = freeKton?.sub(maxKtonLock) ?? BN_ZERO;

    return [ring.isNeg() ? BN_ZERO : ring, kton.isNeg() ? BN_ZERO : kton];
  } catch (err) {
    console.error(err);
    return [BN_ZERO, BN_ZERO];
  }
}
