import { GQL_GET_SUPPORTED_CHAINS } from "../config";
import { SupportedChainsReqParams, SupportedChainsResData, TokenCategory } from "../types";
import { useQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { notification } from "../ui/notification";

export function useSupportedChains(token: TokenCategory) {
  const { loading, data: _data } = useQuery<SupportedChainsResData, SupportedChainsReqParams>(
    GQL_GET_SUPPORTED_CHAINS,
    {
      variables: { tokenKey: token.toUpperCase() as Uppercase<TokenCategory> },
      fetchPolicy: "no-cache",
    },
  );
  const [data, setData] = useState(_data?.queryLnBridgeSupportedChains || []);

  useEffect(() => {
    if (!loading) {
      setData(_data?.queryLnBridgeSupportedChains || []);
      if (!(_data?.queryLnBridgeSupportedChains || []).length) {
        notification.warn({
          title: "No supported chains",
          description: "Cross-chain transfer of this token is temporarily not supported.",
        });
      }
    }
  }, [loading, _data?.queryLnBridgeSupportedChains]);

  return useMemo(() => ({ loading, data }), [loading, data]);
}
