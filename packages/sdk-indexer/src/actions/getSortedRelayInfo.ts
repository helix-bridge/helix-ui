import { graphql } from "../generated/action";
import { execute } from "./helpers";
import { Address } from "viem";
import { Chain } from "@helixbridge/chains";
import { assert } from "./helpers";
import { HelixChain } from "@helixbridge/helixconf";
import type { SortedRelayInfoQuery } from "../generated/action/graphql";

const document = graphql(`
  query SortedRelayInfo($amount: String, $decimals: Int, $token: String, $fromChain: String, $toChain: String) {
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

export type SortedRelayInfo = SortedRelayInfoQuery["sortedLnBridgeRelayInfos"];

export async function getSortedRelayInfo(
  endpoint: string,
  fromChain: Chain,
  toChain: Chain,
  fromToken: Address,
  transferAmount: bigint,
): Promise<SortedRelayInfo> {
  const tokenConf = HelixChain.get(fromChain.id)?.tokens.find(
    (t) => t.address.toLowerCase() === fromToken.toLowerCase(),
  );
  assert(tokenConf, "Token conf not found");

  const { data } = await execute(endpoint, document, {
    fromChain: fromChain.network,
    toChain: toChain.network,
    token: tokenConf.address,
    decimals: tokenConf.decimals,
    amount: transferAmount.toString(),
  });
  return data.sortedLnBridgeRelayInfos;
}
