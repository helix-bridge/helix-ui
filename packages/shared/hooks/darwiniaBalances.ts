import { useCallback } from 'react';
import { AvailableBalance, ChainConfig, DarwiniaAsset, Token } from '../model';
import { entrance, getPolkadotChainProperties, waitUntilConnected } from '../utils/connection';
import { getDarwiniaBalance } from '../utils/network/balance';

type SimpleToken = Pick<Token, 'decimals' | 'symbol'>;

export const getToken: (tokens: SimpleToken[], target: DarwiniaAsset) => SimpleToken = (tokens, target) => {
  const result = tokens.find((token) => token.symbol.toLowerCase().includes(target.toLowerCase()));
  const unknown = { symbol: 'unknown', decimals: 9 };

  return result || unknown;
};

export function useDarwiniaAvailableBalances(network: ChainConfig) {
  const getBalances = useCallback<(acc: string) => Promise<AvailableBalance[]>>(
    async (account: string) => {
      const api = entrance.polkadot.getInstance(network.provider);

      await waitUntilConnected(api);

      const chain = await getPolkadotChainProperties(api);
      const [ring, kton] = await getDarwiniaBalance(network.provider, account);

      return [
        {
          balance: ring,
          ...getToken(chain.tokens, network?.name === 'crab' ? DarwiniaAsset.crab : DarwiniaAsset.ring),
        },
        {
          balance: kton,
          ...getToken(chain.tokens, DarwiniaAsset.kton),
        },
      ];
    },
    [network.name, network.provider]
  );

  return getBalances;
}
