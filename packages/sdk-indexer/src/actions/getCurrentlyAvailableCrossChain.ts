import { graphql } from "../generated";
import { CurrentlyAvailableCrossChainQuery } from "../generated/graphql";
import { execute } from "./helper";

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

export type CurrentlyAvailableCrossChain = CurrentlyAvailableCrossChainQuery["queryLnBridgeSupportedChains"];

export async function getCurrentlyAvailableCrossChain(endpoint: string, tokenKey = "") {
  const { data } = await execute(endpoint, document, { tokenKey });
  return data.queryLnBridgeSupportedChains;
}
