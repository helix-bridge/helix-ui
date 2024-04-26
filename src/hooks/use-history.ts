import { GQL_GET_HISTORY } from "@/config";
import { HistoryReqParams, HistoryResData } from "@/types";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export function useHistory(page: number, enabled?: boolean) {
  const account = useAccount();
  const {
    loading,
    data: _data,
    refetch,
  } = useQuery<HistoryResData, HistoryReqParams>(GQL_GET_HISTORY, {
    variables: { sender: account.address, row: 10, page },
    fetchPolicy: "no-cache",
    skip: !enabled,
  });

  const [data, setData] = useState(_data?.historyRecords.records ?? []);
  const [total, setTotal] = useState(_data?.historyRecords.total ?? 0);
  useEffect(() => {
    if (!loading) {
      setData(_data?.historyRecords.records ?? []);
      setTotal(_data?.historyRecords.total ?? 0);
    }
  }, [loading, _data?.historyRecords]);

  return { loading, data, total, refetch };
}
