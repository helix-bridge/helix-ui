import { graphql } from "../generated";
import { execute } from "./helper";
import { Address } from "viem";
import { Chain } from "@helixbridge/chains";
import { assert } from "./helper";
import { HelixChain } from "@helixbridge/helixconf";
import type { SortedRelayInfoQuery } from "../generated/graphql";

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
        id
        version
        nonce
        targetNonce
        fromChain
        toChain
        bridge
        relayer
        sendToken
        tokenKey
        transactionHash
        timestamp
        margin
        protocolFee
        baseFee
        liquidityFeeRate
        slashCount
        withdrawNonce
        lastTransferId
        cost
        profit
        heartbeatTimestamp
        messageChannel
        transferLimit
        softTransferLimit
        paused
        dynamicFee
        dynamicFeeExpire
        dynamicFeeSignature
        signers
      }
    }
  }
`);

export type SortedRelayInfo = SortedRelayInfoQuery["sortedLnBridgeRelayInfos"];

export async function getSortedRelayInfo(
  endpoint: string,
  fromChain: Chain,
  toChain: Chain,
  transferToken: Address,
  transferAmount: bigint,
): Promise<SortedRelayInfo> {
  const tokenConf = HelixChain.get(fromChain.id)?.tokens.find(
    (t) => t.address.toLowerCase() === transferToken.toLowerCase(),
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
