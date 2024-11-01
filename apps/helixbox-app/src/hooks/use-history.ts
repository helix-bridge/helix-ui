import { GQL_GET_HISTORY } from "../config";
import { HistoryReqParams, HistoryResData } from "../types";
import { useQuery } from "@apollo/client";
import { useAccount } from "wagmi";

export function useHistory(page: number, enabled?: boolean) {
  const account = useAccount();
  const {
    loading,
    data: _data,
    refetch,
  } = useQuery<HistoryResData, HistoryReqParams>(GQL_GET_HISTORY, {
    variables: { bridges: ["lnv2-opposite", "lnv2-default", "lnv3"], sender: account.address, row: 10, page },
    fetchPolicy: "cache-and-network",
    pollInterval: enabled ? 3000 : 0,
    skip: !enabled,
  });

  return { loading, data: _data?.historyRecords.records ?? [], total: _data?.historyRecords.total ?? 0, refetch };
}
