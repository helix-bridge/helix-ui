import { Address } from "viem";
import { graphql } from "../generated/action";
import { LnBridgeExistQuery } from "../generated/action/graphql";
import { execute } from "./helpers";
import { Chain } from "@helixbridge/chains";

const document = graphql(`
  query LnBridgeExist($fromChainId: Int, $toChainId: Int, $fromToken: String, $toToken: String, $version: String) {
    checkLnBridgeExist(
      fromChainId: $fromChainId
      toChainId: $toChainId
      fromToken: $fromToken
      toToken: $toToken
      version: $version
    )
  }
`);

export type LnBridgeExist = NonNullable<LnBridgeExistQuery["checkLnBridgeExist"]>;

export async function isCrossChainSupportedByLnBridge(
  endpoint: string,
  fromChain: Chain,
  toChain: Chain,
  fromToken: Address,
  toToken: Address,
  version: string,
): Promise<LnBridgeExist> {
  const { data } = await execute(endpoint, document, {
    fromChainId: fromChain.id,
    toChainId: toChain.id,
    fromToken,
    toToken,
    version,
  });
  return !!data.checkLnBridgeExist;
}
