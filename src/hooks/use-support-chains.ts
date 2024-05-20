import { GQL_GET_SUPPORT_CHAINS } from "../config";
import { SupportChainsReqParams, SupportChainsResData, TokenCategory } from "../types";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { notification } from "../ui/notification";

export function useSupportChains(token: TokenCategory) {
  const { loading, data: _data } = useQuery<SupportChainsResData, SupportChainsReqParams>(GQL_GET_SUPPORT_CHAINS, {
    variables: { token: token.toUpperCase() as Uppercase<TokenCategory> },
    fetchPolicy: "no-cache",
  });
  const [data, setData] = useState(_data?.queryLnBridgeSupportChains || []);

  useEffect(() => {
    if (!loading) {
      setData(_data?.queryLnBridgeSupportChains || []);
      if (!(_data?.queryLnBridgeSupportChains || []).length) {
        notification.warn({
          title: "No supported chains",
          description: "Cross-chain transfer of this token is temporarily not supported.",
        });
      }
    }
  }, [loading, _data?.queryLnBridgeSupportChains]);

  return { loading, data };
}
