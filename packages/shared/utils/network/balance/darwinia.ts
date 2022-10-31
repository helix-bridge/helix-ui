import type { AccountInfo } from '@darwinia/types';
import { BN, bnMax, BN_ZERO } from '@polkadot/util';
import { waitUntilConnected } from '../../connection/polkadot';
import { entrance } from '../../connection/entrance';

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

    // !FIXME: The type should be PalletBalancesBalanceLock; If we specify the type exactly, we need to import the @polkadot/api also, and it will broke the build process.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locks = await api.query.balances.locks<any[]>(account);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ktonLocks = (await api.query.kton?.locks<any[]>(account)) ?? [];

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
    return [BN_ZERO, BN_ZERO];
  }
}
