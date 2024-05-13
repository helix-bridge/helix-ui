import { GQL_GET_WITHDRAWABLE_LIQUIDITIES } from "@/config";
import { Network, WithdrawableLiquiditiesReqParams, WithdrawableLiquiditiesResData } from "@/types";
import { useQuery } from "@apollo/client";
import { useCallback } from "react";
import { Address } from "viem";

export function useWithdrawableLiquidities(
  relayer: Address | null | undefined,
  recvTokenAddress: Address | null | undefined,
  fromChain: Network | null | undefined,
  toChain: Network | null | undefined,
) {
  const { loading, data, refetch, fetchMore } = useQuery<
    WithdrawableLiquiditiesResData,
    WithdrawableLiquiditiesReqParams
  >(GQL_GET_WITHDRAWABLE_LIQUIDITIES, {
    variables: { page: 0, relayer, recvTokenAddress, fromChain, toChain },
    skip: !relayer || !recvTokenAddress || !fromChain || !toChain,
    fetchPolicy: "no-cache",
  });

  const handleRefetch = useCallback(() => {
    refetch({ page: 0 });
  }, [refetch]);

  const handleFetchMore = useCallback(() => {
    fetchMore({ variables: { page: data?.historyRecords.records.length } });
  }, [data?.historyRecords.records.length, fetchMore]);

  return {
    loading,
    total: data?.historyRecords.total ?? 0,
    data: data?.historyRecords.records ?? [],
    refetch: handleRefetch,
    fetchMore: handleFetchMore,
  };
}
