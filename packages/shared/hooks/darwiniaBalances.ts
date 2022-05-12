import { AccountData, AccountInfo } from '@darwinia/types';
import { ApiPromise } from '@polkadot/api';
import { BN } from 'bn.js';
import { useCallback } from 'react';
import { AvailableBalance, ChainConfig, DarwiniaAsset, Token } from '../model';
import { entrance, getPolkadotChainProperties, waitUntilConnected } from '../utils/connection';

type SimpleToken = Pick<Token, 'decimals' | 'symbol'>;

export const getToken: (tokens: SimpleToken[], target: DarwiniaAsset) => SimpleToken = (tokens, target) => {
  const result = tokens.find((token) => token.symbol.toLowerCase().includes(target.toLowerCase()));
  const unknown = { symbol: 'unknown', decimals: 9 };

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

export function useDarwiniaAvailableBalances(network: ChainConfig) {
  const getBalances = useCallback<(acc: string) => Promise<AvailableBalance[]>>(
    async (account: string) => {
      const api = entrance.polkadot.getInstance(network.provider);

      await waitUntilConnected(api);

      const chain = await getPolkadotChainProperties(api);
      const [ring, kton] = await getDarwiniaBalances(api, account);

      return [
        {
          balance: new BN(ring),
          ...getToken(chain.tokens, network?.name === 'crab' ? DarwiniaAsset.crab : DarwiniaAsset.ring),
        },
        {
          balance: new BN(kton),
          ...getToken(chain.tokens, DarwiniaAsset.kton),
        },
      ];
    },
    [network.name, network.provider]
  );

  return getBalances;
}
