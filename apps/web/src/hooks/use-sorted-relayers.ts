import { useEffect, useState } from "react";
import { graphql } from "../_generated_/gql";
import { ChainConfig, Token } from "../types";
import { useQuery } from "@apollo/client";

const document = graphql(`
  query SortedRelayers(
    $amount: String
    $decimals: Int
    $bridge: String
    $token: String
    $fromChain: String
    $toChain: String
  ) {
    sortedLnBridgeRelayInfos(
      amount: $amount
      decimals: $decimals
      bridge: $bridge
      token: $token
      fromChain: $fromChain
      toChain: $toChain
    ) {
      transferLimit
      records {
        sendToken
        relayer
        margin
        baseFee
        protocolFee
        liquidityFeeRate
        lastTransferId
        withdrawNonce
        bridge
      }
    }
  }
`);

export function useSortedRelayers(amount: bigint, token: Token, sourceChain: ChainConfig, targetChain: ChainConfig) {
  const {
    loading,
    data: _data,
    refetch,
  } = useQuery(document, {
    variables: {
      amount: amount.toString(),
      decimals: token.decimals,
      token: token.address,
      fromChain: sourceChain.network,
      toChain: targetChain.network,
    },
    fetchPolicy: "cache-and-network",
  });
  const [data, setData] = useState(_data);

  useEffect(() => {
    if (!loading) {
      setData(_data);
    }
  }, [loading, _data]);

  return { loading, data, refetch };
}
