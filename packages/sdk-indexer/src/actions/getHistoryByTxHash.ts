import { Hash } from "viem";
import { graphql } from "../generated";
import { HistoryByTxHashQuery } from "../generated/graphql";
import { getEndpoint } from "../utils";
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
  query HistoryByTxHash($txHash: String) {
    historyRecordByTxHash(txHash: $txHash) {
      requestTxHash
      responseTxHash
      fromChain
      toChain
      startTime
      sendToken
      sendAmount
      confirmedBlocks
      result
      id
    }
  }
`);

export type HistoryByTxHash = HistoryByTxHashQuery["historyRecordByTxHash"];

export async function getHistoryByTxHash(isTestnet: boolean, txHash: Hash) {
  const { data } = await execute(getEndpoint(isTestnet), document, { txHash });
  return data.historyRecordByTxHash;
}
