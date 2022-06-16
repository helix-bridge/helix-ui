import { AccountData, AccountInfo } from '@darwinia/types';
import { BN_ZERO } from '@polkadot/util';
import BN from 'bn.js';
import { entrance, waitUntilConnected } from '../../connection';

/**
 * @description other api can get balances:  api.derive.balances.all, api.query.system.account;
 * @see https://github.com/darwinia-network/wormhole-ui/issues/142
 */
export async function getBalance(provider: string, account: string): Promise<BN> {
  const api = entrance.polkadot.getInstance(provider);

  await waitUntilConnected(api);

  try {
    const { data } = (await api.query.system.account(account)) as AccountInfo;
    const { free } = data as unknown as AccountData;

    return new BN(free.toString());
  } catch (error) {
    console.warn('🚨 ~ file: parachain.ts ~ line 21 ~ getBalance ~ error', (error as Record<string, string>).message);

    return BN_ZERO;
  }
}
