import { GraphQLClient, useQuery } from 'graphql-hooks';
import { darwiniaCrabDVM, pangoroPangolinDVM } from '../../config/bridge';

const ACCOUNTS = `{
  accounts {
    totalCount
  }
}
`;

export function useAccountStatistic() {
  const fetchS2sTest = useQuery<{ accounts: { totalCount: number } }>(ACCOUNTS, {
    client: new GraphQLClient({ url: pangoroPangolinDVM.config.api.subql + pangoroPangolinDVM.departure.name }),
  });

  const fetchS2sFormal = useQuery<{ accounts: { totalCount: number } }>(ACCOUNTS, {
    client: new GraphQLClient({ url: darwiniaCrabDVM.config.api.subql + darwiniaCrabDVM.departure.name }),
  });

  return {
    total:
      ((fetchS2sTest.data && fetchS2sTest.data.accounts.totalCount) || 0) +
      ((fetchS2sFormal.data && fetchS2sFormal.data.accounts.totalCount) || 0),
  };
}
