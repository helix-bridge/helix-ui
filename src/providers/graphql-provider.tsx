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
              keyArgs: (args) => (args?.needWithdrawLiquidity ? false : undefined),
              merge: (existing, incoming, { args }) => {
                if (args?.needWithdrawLiquidity) {
                  const offset = args?.offset ?? 0;
                  const merged = existing ? existing.slice(0) : [];
                  for (let i = 0; i < incoming.length; ++i) {
                    merged[offset + i] = incoming[i];
                  }
                  return merged;
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
