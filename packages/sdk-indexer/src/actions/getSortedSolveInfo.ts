import { graphql } from "../generated";
import { execute } from "./helper";
import { getEndpoint } from "../utils";
import { Address, Chain } from "viem";
import { getChainByIdOrNetwork } from "@helixbridge/chains";
import { assert } from "./helper";
import { HelixChain } from "@helixbridge/helixconf";
import type { SortedSolveInfoQuery } from "../generated/graphql";

const document = graphql(`
  query SortedSolveInfo($amount: String, $decimals: Int, $token: String, $fromChain: String, $toChain: String) {
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

export type SortedSolveInfo = SortedSolveInfoQuery["sortedLnBridgeRelayInfos"];

export async function getSortedSolveInfo(
  fromChain: Chain,
  toChain: Chain,
  transferToken: Address,
  transferAmount: bigint,
): Promise<SortedSolveInfo> {
  const sourceChain = getChainByIdOrNetwork(fromChain.id);
  assert(sourceChain, "Source chain not found");
  const targetChain = getChainByIdOrNetwork(toChain.id);
  assert(targetChain, "Target chain not found");

  const tokenConf = HelixChain.get(fromChain.id)?.tokens.find(
    (t) => t.address.toLowerCase() === transferToken.toLowerCase(),
  );
  assert(tokenConf, "Token conf not found");

  const { data } = await execute(getEndpoint(sourceChain.testnet), document, {
    fromChain: sourceChain.network,
    toChain: targetChain.network,
    token: tokenConf.address,
    decimals: tokenConf.decimals,
    amount: transferAmount.toString(),
  });
  return data.sortedLnBridgeRelayInfos;
}
