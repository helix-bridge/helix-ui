import { graphql } from "../_generated_/gql";
import { ChainConfig, Token } from "../types";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

const document = graphql(`
  query QueryMaxTransfer($token: String, $balance: String, $fromChain: String, $toChain: String) {
    queryMaxTransfer(token: $token, balance: $balance, fromChain: $fromChain, toChain: $toChain)
  }
`);

export function useMaxTransfer(sourceChain: ChainConfig, targetChain: ChainConfig, token: Token, balance: bigint) {
  const { loading, data } = useQuery(document, {
    variables: {
      fromChain: sourceChain.network,
      toChain: targetChain.network,
      token: token.address,
      balance: balance.toString(),
    },
    fetchPolicy: "cache-and-network",
  });
  const [maxTransfer, setMaxTransfer] = useState(BigInt(Number.MAX_SAFE_INTEGER) ** BigInt(token.decimals));

  useEffect(() => {
    if (!loading) {
      setMaxTransfer((prev) => BigInt(data?.queryMaxTransfer ?? prev));
    }
  }, [loading, data?.queryMaxTransfer]);

  return { loadingMaxTransfer: loading, maxTransfer };
}
