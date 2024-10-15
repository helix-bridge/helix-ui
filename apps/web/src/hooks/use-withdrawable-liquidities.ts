import { Network } from "../types";
import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useRef } from "react";
import { Address } from "viem";
import { graphql } from "../_generated_/gql";

const document = graphql(`
  query QueryWithdrawableLiquidities(
    $row: Int!
    $page: Int!
    $relayer: String = ""
    $recvTokenAddress: String = ""
    $fromChain: String = ""
    $toChain: String = ""
  ) {
    historyRecords(
      row: $row
      page: $page
      relayer: $relayer
      recvTokenAddress: $recvTokenAddress
      fromChains: [$fromChain]
      toChains: [$toChain]
      needWithdrawLiquidity: true
    ) {
      total
      records {
        id
        sendAmount
        lastRequestWithdraw
      }
    }
  }
`);

export function useWithdrawableLiquidities(
  relayer: Address | null | undefined,
  recvTokenAddress: Address | null | undefined,
  fromChain: Network | null | undefined,
  toChain: Network | null | undefined,
  initRow = 10,
) {
  const pageRef = useRef(0);
  useEffect(() => {
    pageRef.current = 0;
  }, [relayer, recvTokenAddress, fromChain, toChain]);

  const { loading, data, refetch, fetchMore } = useQuery(document, {
    variables: { page: 0, row: initRow, relayer, recvTokenAddress, fromChain, toChain },
    skip: !relayer || !recvTokenAddress || !fromChain || !toChain,
    fetchPolicy: "cache-and-network", // Should use cache to adapt fetchMore
  });

  const handleRefetch = useCallback(() => {
    refetch({ page: 0 });
    pageRef.current = 0;
  }, [refetch]);

  const handleFetchMore = useCallback(() => {
    pageRef.current = pageRef.current + 1;
    fetchMore({ variables: { page: pageRef.current } });
  }, [fetchMore]);

  return {
    loading,
    data: data?.historyRecords,
    refetch: handleRefetch,
    fetchMore: handleFetchMore,
  };
}
