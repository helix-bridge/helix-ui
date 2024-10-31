import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { PropsWithChildren } from "react";

const uri = import.meta.env.VITE_GRAPHQL_ENDPOINT || "";

export default function GraphqlProvider({ children }: PropsWithChildren<unknown>) {
  const client = new ApolloClient({
    uri,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            historyRecords: {
              keyArgs: (args) =>
                args?.needWithdrawLiquidity
                  ? ["relayer", "recvTokenAddress", "fromChains", "toChains", "row"]
                  : undefined,
              merge: (existing, incoming, { args }) => {
                if (args?.needWithdrawLiquidity) {
                  const offset = (args?.page ?? 0) * (args.row ?? 0);
                  const records = existing ? existing.records.slice(0) : [];
                  for (let i = 0; i < incoming.records.length; ++i) {
                    records[offset + i] = incoming.records[i];
                  }
                  return { total: incoming.total, records };
                }
                return incoming;
              },
            },
          },
        },
      },
    }),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
