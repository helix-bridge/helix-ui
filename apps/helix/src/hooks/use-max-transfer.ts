import { GQL_GET_MAX_TRANSFER } from "../config";
import { ChainConfig, MaxTransferReqParams, MaxTransferResData, Token } from "../types";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

export function useMaxTransfer(sourceChain: ChainConfig, targetChain: ChainConfig, token: Token, balance: bigint) {
  const { loading, data } = useQuery<MaxTransferResData, MaxTransferReqParams>(GQL_GET_MAX_TRANSFER, {
    variables: {
      fromChain: sourceChain.network,
      toChain: targetChain.network,
      token: token.address,
      balance: balance.toString(),
    },
    fetchPolicy: "no-cache",
  });
  const [maxTransfer, setMaxTransfer] = useState(BigInt(Number.MAX_SAFE_INTEGER) ** BigInt(token.decimals));

  useEffect(() => {
    if (!loading) {
      setMaxTransfer((prev) => BigInt(data?.queryMaxTransfer ?? prev));
    }
  }, [loading, data?.queryMaxTransfer]);

  return { loadingMaxTransfer: loading, maxTransfer };
}
