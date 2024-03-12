import { GQL_GET_SUPPORT_CHAINS } from "@/config";
import { SupportChainsReqParams, SupportChainsResData, TokenCategory } from "@/types";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

export function useSupportChains(token: TokenCategory) {
  const { loading, data: _data } = useQuery<SupportChainsResData, SupportChainsReqParams>(GQL_GET_SUPPORT_CHAINS, {
    variables: { token: token.toUpperCase() as Uppercase<TokenCategory> },
  });
  const [data, setData] = useState(_data?.queryLnBridgeSupportChains || []);

  useEffect(() => {
    if (!loading) {
      setData(_data?.queryLnBridgeSupportChains || []);
    }
  }, [loading, _data?.queryLnBridgeSupportChains]);

  return { loading, data };
}
