import { Hash } from "viem";
import { graphql } from "../generated";
import { HistoryTxByHashQuery } from "../generated/graphql";
import { execute } from "./helper";

// enum Result {
//   PENDING,
//   PENDING_TO_REFUND,
//   PENDING_TO_CLAIM,
//   SUCCESS,
//   REFUNDED,
//   PENDING_TO_CONFIRM_REFUND,
//   FAILED,
// }

const document = graphql(`
  query HistoryTxByHash($txHash: String) {
    historyRecordByTxHash(txHash: $txHash) {
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
`);

export type HistoryTxByHash = HistoryTxByHashQuery["historyRecordByTxHash"];

export async function getHistoryTxByHash(endpoint: string, txHash: Hash) {
  const { data } = await execute(endpoint, document, { txHash });
  return data.historyRecordByTxHash;
}
