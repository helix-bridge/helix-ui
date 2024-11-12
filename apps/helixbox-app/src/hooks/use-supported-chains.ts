import { GQL_GET_SUPPORTED_CHAINS } from "../config";
import { SupportedChainsReqParams, SupportedChainsResData, TokenCategory } from "../types";
import { useQuery } from "@apollo/client";
import { useMemo } from "react";

export function useSupportedChains(token: TokenCategory) {
  const { loading, data: _data } = useQuery<SupportedChainsResData, SupportedChainsReqParams>(
    GQL_GET_SUPPORTED_CHAINS,
    {
      variables: { tokenKey: token.toUpperCase() as Uppercase<TokenCategory> },
      fetchPolicy: "cache-and-network",
    },
  );

  return useMemo(
    () => ({ loading, data: _data?.queryLnBridgeSupportedChains || [] }),
    [loading, _data?.queryLnBridgeSupportedChains],
  );
}
