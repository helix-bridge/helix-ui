import { graphql } from "./generated";
import { execute } from "./helper";
import { getIndexerUrl } from "./utils";
import { Address, Chain } from "viem";
import { getChainByIdOrNetwork } from "@helixbridge/chains";
import assert from "assert";
import { HelixChain } from "@helixbridge/helixconf";
import type { SortedRelayersQuery as SortedRelayersQueryType } from "./generated/graphql";

const document = graphql(`
  query SortedRelayers($amount: String, $decimals: Int, $token: String, $fromChain: String, $toChain: String) {
    sortedLnBridgeRelayInfos(
      amount: $amount
      decimals: $decimals
      token: $token
      fromChain: $fromChain
      toChain: $toChain
    ) {
      transferLimit
      records {
        sendToken
        relayer
        margin
        baseFee
        protocolFee
        liquidityFeeRate
        lastTransferId
        withdrawNonce
        bridge
      }
    }
  }
`);

export type SortedRelayersQuery = SortedRelayersQueryType["sortedLnBridgeRelayInfos"];

export async function getSortedRelayers(
  fromChain: Chain,
  toChain: Chain,
  token: Address,
  amount: bigint,
): Promise<SortedRelayersQuery> {
  const sourceChain = getChainByIdOrNetwork(fromChain.id);
  assert(sourceChain, "Source chain not found");
  const targetChain = getChainByIdOrNetwork(toChain.id);
  assert(targetChain, "Target chain not found");

  const tokenConf = HelixChain.get(fromChain.id)?.tokens.find((t) => t.address.toLowerCase() === token.toUpperCase());
  assert(tokenConf, "Token conf not found");

  const data = await execute(getIndexerUrl(sourceChain), document, {
    fromChain: sourceChain.network,
    toChain: targetChain.network,
    token: tokenConf.address,
    decimals: tokenConf.decimals,
    amount: amount.toString(),
  });
  return data.sortedLnBridgeRelayInfos;
}
