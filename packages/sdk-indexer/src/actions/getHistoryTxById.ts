import { graphql } from "../generated/action";
import { HistoryTxByIdQuery } from "../generated/action/graphql";
import { execute } from "./helpers";

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
  query HistoryTxById($id: String) {
    historyRecordById(id: $id) {
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

export type HistoryTxById = HistoryTxByIdQuery["historyRecordById"];

export async function getHistoryTxById(endpoint: string, id: string) {
  const { data } = await execute(endpoint, document, { id });
  return data.historyRecordById;
}
