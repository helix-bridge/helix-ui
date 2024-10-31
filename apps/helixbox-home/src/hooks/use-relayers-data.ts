import { GQL_GET_RELAYERS } from "../config";
import { BridgeVersion, ChainConfig, RelayersReqParams, RelayersResData } from "../types";
import { useQuery } from "@apollo/client";

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

  return {
    loading,
    data: _data?.queryLnBridgeRelayInfos.records ?? [],
    total: _data?.queryLnBridgeRelayInfos.total ?? 0,
    refetch,
  };
}
