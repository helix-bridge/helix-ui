import { GQL_GET_TXS } from "../config";
import { TxsReqParams, TxsResData } from "../types";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

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

  const [data, setData] = useState(_data?.historyRecords.records ?? []);
  const [total, setTotal] = useState(_data?.historyRecords.total ?? 0);

  useEffect(() => {
    if (!loading) {
      setData(_data?.historyRecords.records ?? []);
      setTotal(_data?.historyRecords.total ?? 0);
    }
  }, [loading, _data?.historyRecords.records, _data?.historyRecords.total]);

  return { loading, data, total, networkStatus, refetch };
}
