import { GQL_GET_RELAYERS } from "../config";
import { BridgeVersion, ChainConfig, RelayersReqParams, RelayersResData } from "../types";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

export function useRelayersData(
  version: BridgeVersion,
  page: number,
  row: number,
  relayer?: string,
  sourceChain?: ChainConfig,
  targetChain?: ChainConfig,
) {
  const {
    loading,
    data: _data,
    refetch,
  } = useQuery<RelayersResData, RelayersReqParams>(GQL_GET_RELAYERS, {
    variables: {
      relayer: typeof relayer === "string" ? relayer.toLowerCase() || undefined : "",
      fromChain: sourceChain?.network,
      toChain: targetChain?.network,
      version,
      page,
      row,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const [data, setData] = useState(_data?.queryLnBridgeRelayInfos.records ?? []);
  const [total, setTotal] = useState(_data?.queryLnBridgeRelayInfos.total ?? 0);
  useEffect(() => {
    if (!loading) {
      setData(_data?.queryLnBridgeRelayInfos.records ?? []);
      setTotal(_data?.queryLnBridgeRelayInfos.total ?? 0);
    }
  }, [loading, _data?.queryLnBridgeRelayInfos]);

  return { loading, data, total, refetch };
}
