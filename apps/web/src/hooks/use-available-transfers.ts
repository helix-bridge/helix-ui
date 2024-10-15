import { graphql } from "../_generated_/gql";
import { TokenCategory } from "../types";
import { useQuery } from "@apollo/client";
import { useMemo } from "react";

const document = graphql(`
  query QuerySupportedTransfers($tokenKey: String!) {
    queryLnBridgeSupportedChains(tokenKey: $tokenKey) {
      tokenKey
      chains {
        fromChain
        toChains
      }
    }
  }
`);

/**
 * Which token from which chain to which chain is available
 * @param token Token category
 * @returns Available transfers
 */
export function useAvailableTransfers(token: TokenCategory) {
  const { loading, data: _data } = useQuery(document, {
    variables: { tokenKey: token.toUpperCase() as Uppercase<TokenCategory> },
    fetchPolicy: "cache-and-network",
  });

  return useMemo(
    () => ({ loading, data: _data?.queryLnBridgeSupportedChains }),
    [loading, _data?.queryLnBridgeSupportedChains],
  );
}
