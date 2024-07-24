import { Hash } from "viem";
import { GQL_GET_HISTORY_DETAILS } from "../config";
import { HistoryDetailsReqParams, HistoryDetailsResData } from "../types";
import { useQuery } from "@apollo/client";

export function useHistoryDetails(txHash: Hash | null | undefined) {
  const { loading, data } = useQuery<HistoryDetailsResData, HistoryDetailsReqParams>(GQL_GET_HISTORY_DETAILS, {
    variables: { txHash: txHash ?? "" },
    fetchPolicy: "no-cache",
    pollInterval: txHash ? 4500 : 0,
    skip: !txHash,
  });

  return { loading, data: data?.historyRecordByTxHash };
}
