import { AccountInfo, AccountData } from '@darwinia/types';
import { ApiPromise } from '@polkadot/api';
import { useCallback } from 'react';
import { AvailableBalance, DarwiniaAsset, Token } from '../model';
import { waitUntilConnected } from '../utils';
import { useApi } from './api';

export const getToken: (tokens: Token[], target: DarwiniaAsset) => Token = (tokens, target) => {
  const result = tokens.find((token) => token.symbol.toLowerCase().includes(target.toLowerCase()));
  const unknown: Token = { symbol: 'unknown', decimal: 'gwei' };

  return result || unknown;
};

/**
 * @description other api can get balances:  api.derive.balances.all, api.query.system.account;
 * @see https://github.com/darwinia-network/wormhole-ui/issues/142
 */
async function getDarwiniaBalances(api: ApiPromise, account = ''): Promise<[string, string]> {
  await waitUntilConnected(api);

  try {
    // type = 0 query ring balance.  type = 1 query kton balance.
    /* eslint-disable */
    const ringUsableBalance = await (api.rpc as any).balances.usableBalance(0, account);
    const ktonUsableBalance = await (api.rpc as any).balances.usableBalance(1, account);
    /* eslint-enable */

    return [ringUsableBalance.usableBalance.toString(), ktonUsableBalance.usableBalance.toString()];
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

    return [free.toString(), freeKton.toString()];
  } catch (error) {
    console.warn(
      '%c [ Failed to  querying balance through account info ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );

    return ['0', '0'];
  }
}

export function useDarwiniaAvailableBalances() {
  const { api, chain, network } = useApi();

  const getBalances = useCallback<(acc: string) => Promise<AvailableBalance[]>>(
    async (account: string | undefined | null) => {
      if (!api || !account) {
        return [];
      }

      const [ring, kton] = await getDarwiniaBalances(api, account);

      return [
        {
          max: ring,
          asset: DarwiniaAsset.ring,
          checked: true,
          token: getToken(chain.tokens, network?.name === 'crab' ? DarwiniaAsset.crab : DarwiniaAsset.ring),
        },
        {
          max: kton,
          asset: DarwiniaAsset.kton,
          token: getToken(chain.tokens, DarwiniaAsset.kton),
        },
      ];
    },
    [api, chain.tokens, network?.name]
  );

  return getBalances;
}
