import { PolkadotChain } from '@helix/shared/model';
import { GraphQLClient, useQuery } from 'graphql-hooks';

const ACCOUNTS = `
query accounts($chain: String) {
  accounts(chain: $chain) {
    total
  }
} 
`;

export function useAccountStatistic(url: string, chain?: PolkadotChain) {
  const fetchS2sFormal = useQuery<{ accounts: { total: number } }>(ACCOUNTS, {
    client: new GraphQLClient({ url }),
    variables: { chain },
  });

  return {
    total: (fetchS2sFormal.data && fetchS2sFormal.data.accounts.total) || 0,
  };
}
