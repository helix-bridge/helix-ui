import { graphql } from "../generated/action";
import { CurrentlyAvailableCrossChainQuery } from "../generated/action/graphql";
import { execute } from "./helpers";

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

export type CurrentlyAvailableCrossChain = NonNullable<
  CurrentlyAvailableCrossChainQuery["queryLnBridgeSupportedChains"]
>;

export async function getCurrentlyAvailableCrossChain(
  endpoint: string,
  tokenKey = "",
): Promise<CurrentlyAvailableCrossChain> {
  const { data } = await execute(endpoint, document, { tokenKey });
  return data.queryLnBridgeSupportedChains || [];
}
