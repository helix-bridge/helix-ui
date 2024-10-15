import { Hash } from "viem";
import { useQuery } from "@apollo/client";
import { graphql } from "../_generated_/gql";

const document = graphql(`
  query QueryHistoryDetails($txHash: String) {
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

export function useHistoryDetails(txHash: Hash | null | undefined) {
  const { loading, data } = useQuery(document, {
    variables: { txHash: txHash ?? "" },
    fetchPolicy: "cache-and-network",
    pollInterval: txHash ? 4500 : 0,
    skip: !txHash,
  });

  return { loading, data: data?.historyRecordByTxHash };
}
