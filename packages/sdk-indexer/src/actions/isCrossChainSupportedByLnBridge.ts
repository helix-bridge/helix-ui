import { Address } from "viem";
import { graphql } from "../generated";
import { LnBridgeExistQuery } from "../generated/graphql";
import { execute } from "./helper";

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
  fromChainId: number,
  toChainId: number,
  fromToken: Address,
  toToken: Address,
  version: string,
): Promise<LnBridgeExist> {
  const { data } = await execute(endpoint, document, { fromChainId, toChainId, fromToken, toToken, version });
  return !!data.checkLnBridgeExist;
}
