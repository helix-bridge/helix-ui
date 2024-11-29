import { useQuery } from "@apollo/client";
import { graphql } from "../generated/hook";

const document = graphql(`
  query CurrentlyAvailableCrossChain($tokenKey: String!) {
    queryLnBridgeSupportedChains(tokenKey: $tokenKey) {
      tokenKey
      chains {
        fromChain
        toChains
      }
    }
  }
`);

export function useCurrentlyAvailableCrossChain(tokenKey = "") {
  const { data, loading } = useQuery(document, {
    variables: { tokenKey: tokenKey.toUpperCase() },
    fetchPolicy: "cache-and-network",
  });
  console.log("data", data);
  return { data: data?.queryLnBridgeSupportedChains || [], loading };
}
