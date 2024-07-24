import { GQL_SORTED_LNBRIDGE_RELAY_INFOS } from "../config";
import { ChainConfig, SortedLnBridgeRelayInfosReqParams, SortedLnBridgeRelayInfosResData, Token } from "../types";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

export function useSortedRelayData(amount: bigint, token: Token, sourceChain: ChainConfig, targetChain: ChainConfig) {
  const {
    loading,
    data: _data,
    refetch,
  } = useQuery<SortedLnBridgeRelayInfosResData, SortedLnBridgeRelayInfosReqParams>(GQL_SORTED_LNBRIDGE_RELAY_INFOS, {
    variables: {
      amount: amount.toString(),
      decimals: token.decimals,
      token: token.address,
      fromChain: sourceChain.network,
      toChain: targetChain.network,
    },
  });
  const [data, setData] = useState(_data);

  useEffect(() => {
    if (!loading) {
      setData(_data);
    }
  }, [loading, _data]);

  return { loading, data, refetch };
}
