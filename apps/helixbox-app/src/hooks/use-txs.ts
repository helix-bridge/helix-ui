import { GQL_GET_TXS } from "../config";
import { TxsReqParams, TxsResData } from "../types";
import { useQuery } from "@apollo/client";

export function useTxs(sender: string, page: number, row = 10) {
  const {
    loading,
    data: _data,
    networkStatus,
    refetch,
  } = useQuery<TxsResData, TxsReqParams>(GQL_GET_TXS, {
    variables: { sender, bridges: ["lnv3", "lnv2-default", "lnv2-opposite"], page, row },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  return {
    loading,
    data: _data?.historyRecords.records ?? [],
    total: _data?.historyRecords.total ?? 0,
    networkStatus,
    refetch,
  };
}
