import { Hash } from "viem";
import { GQL_GET_HISTORY_DETAILS } from "../config";
import { HistoryDetailsReqParams, HistoryDetailsResData } from "../types";
import { useQuery } from "@apollo/client";

export function useHistoryDtails(txHash: Hash) {
  const { loading, data } = useQuery<HistoryDetailsResData, HistoryDetailsReqParams>(GQL_GET_HISTORY_DETAILS, {
    variables: { txHash },
    fetchPolicy: "no-cache",
    pollInterval: 1500,
  });

  return { loading, data: data?.historyRecordByTxHash };
}
