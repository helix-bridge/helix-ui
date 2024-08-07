import { GQL_GET_WITHDRAWABLE_LIQUIDITIES } from "../config";
import { Network, WithdrawableLiquiditiesReqParams, WithdrawableLiquiditiesResData } from "../types";
import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useRef } from "react";
import { Address } from "viem";

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

  const { loading, data, refetch, fetchMore } = useQuery<
    WithdrawableLiquiditiesResData,
    WithdrawableLiquiditiesReqParams
  >(GQL_GET_WITHDRAWABLE_LIQUIDITIES, {
    variables: { page: 0, row: initRow, relayer, recvTokenAddress, fromChain, toChain },
    skip: !relayer || !recvTokenAddress || !fromChain || !toChain,
    // fetchPolicy: "no-cache",  // Should use cache to adapt fetchMore
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
    total: data?.historyRecords.total ?? 0,
    data: data?.historyRecords.records ?? [],
    refetch: handleRefetch,
    fetchMore: handleFetchMore,
  };
}
