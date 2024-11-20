import { Address } from "viem";
import { graphql } from "../generated";
import { execute } from "./helper";
import { Chain } from "@helixbridge/chains";
import { WithdrawableTXsQuery } from "../generated/graphql";

const document = graphql(`
  query WithdrawableTXs(
    $row: Int!
    $page: Int!
    $relayer: String = ""
    $toToken: String = ""
    $fromChain: String = ""
    $toChain: String = ""
  ) {
    historyRecords(
      row: $row
      page: $page
      relayer: $relayer
      recvTokenAddress: $toToken
      fromChains: [$fromChain]
      toChains: [$toChain]
      needWithdrawLiquidity: true
    ) {
      total
      records {
        id
        fromChain
        toChain
        bridge
        reason
        nonce
        requestTxHash
        responseTxHash
        sender
        recipient
        sendToken
        recvToken
        sendAmount
        recvAmount
        startTime
        endTime
        result
        fee
        feeToken
        messageNonce
        sendTokenAddress
        recvTokenAddress
        sendOuterTokenAddress
        recvOuterTokenAddress
        guardSignatures
        relayer
        endTxHash
        confirmedBlocks
        needWithdrawLiquidity
        lastRequestWithdraw
        extData
      }
    }
  }
`);

export type WithdrawableTXs = WithdrawableTXsQuery["historyRecords"];

export async function getWithdrawableTXs(
  endpoint: string,
  row: number,
  page: number,
  relayer: Address,
  toToken: Address,
  fromChain: Chain,
  toChain: Chain,
) {
  const { data } = await execute(endpoint, document, {
    row,
    page,
    relayer,
    toToken,
    fromChain: fromChain.network,
    toChain: toChain.network,
  });
  return data.historyRecords;
}
