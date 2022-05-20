import { AccountData, AccountInfo } from '@darwinia/types';
import { BN_ZERO } from '@polkadot/util';
import BN from 'bn.js';
import { entrance, waitUntilConnected } from '../../connection';

/**
 * @description other api can get balances:  api.derive.balances.all, api.query.system.account;
 * @see https://github.com/darwinia-network/wormhole-ui/issues/142
 */
export async function getBalance(provider: string, account: string): Promise<[BN, BN]> {
  const api = entrance.polkadot.getInstance(provider);

  await waitUntilConnected(api);

  try {
    // type = 0 query ring balance.  type = 1 query kton balance.
    /* eslint-disable */
    const ringUsableBalance = await (api.rpc as any).balances.usableBalance(0, account);
    const ktonUsableBalance = await (api.rpc as any).balances.usableBalance(1, account);
    /* eslint-enable */

    return [new BN(ringUsableBalance.usableBalance.toString()), new BN(ktonUsableBalance.usableBalance.toString())];
  } catch (error: unknown) {
    console.warn(
      '%c [ Failed to  querying balance through rpc ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );
  }

  try {
    const { data } = (await api.query.system.account(account)) as AccountInfo;
    const { free, freeKton } = data as unknown as AccountData;

    return [new BN(free.toString()), new BN(freeKton.toString())];
  } catch (error) {
    console.warn(
      '%c [ Failed to  querying balance through account info ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );

    return [BN_ZERO, BN_ZERO];
  }
}
