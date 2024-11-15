import { graphql } from "../generated";
import { AvailableCrossChainQuery } from "../generated/graphql";
import { execute } from "./helper";
import { getEndpoint } from "../utils";

const document = graphql(`
  query AvailableCrossChain($tokenKey: String!) {
    queryLnBridgeSupportedChains(tokenKey: $tokenKey) {
      tokenKey
      chains {
        fromChain
        toChains
      }
    }
  }
`);

export type AvailableCrossChain = AvailableCrossChainQuery["queryLnBridgeSupportedChains"];

export async function getAvailableCrossChain(isTestnet: boolean, tokenKey = "") {
  const { data } = await execute(getEndpoint(isTestnet), document, { tokenKey });
  return data.queryLnBridgeSupportedChains;
}
