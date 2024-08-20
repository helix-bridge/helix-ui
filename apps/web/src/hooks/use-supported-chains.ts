import { GQL_GET_SUPPORTED_CHAINS } from "../config";
import { SupportedChainsReqParams, SupportedChainsResData, TokenCategory } from "../types";
import { useQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";

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
    }
  }, [loading, _data?.queryLnBridgeSupportedChains]);

  return useMemo(() => ({ loading, data }), [loading, data]);
}
