import { graphql } from "../_generated_/gql";
import { BridgeVersion, ChainConfig } from "../types";
import { useQuery } from "@apollo/client";

const document = graphql(`
  query QueryRelayersData(
    $fromChain: String
    $toChain: String
    $relayer: String
    $version: String
    $page: Int
    $row: Int
  ) {
    queryLnBridgeRelayInfos(
      fromChain: $fromChain
      toChain: $toChain
      relayer: $relayer
      version: $version
      page: $page
      row: $row
    ) {
      total
      records {
        id
        fromChain
        toChain
        bridge
        relayer
        sendToken
        margin
        baseFee
        liquidityFeeRate
        cost
        profit
        heartbeatTimestamp
        messageChannel
        lastTransferId
        withdrawNonce
        transferLimit
        signers
      }
    }
  }
`);

export function useRelayersData(
  version: BridgeVersion,
  page: number,
  row: number,
  relayer?: string,
  sourceChain?: ChainConfig,
  targetChain?: ChainConfig,
) {
  const {
    loading,
    data: _data,
    refetch,
  } = useQuery(document, {
    variables: {
      relayer: typeof relayer === "string" ? relayer.toLowerCase() || undefined : "",
      fromChain: sourceChain?.network,
      toChain: targetChain?.network,
      version,
      page,
      row,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  return {
    loading,
    data: _data?.queryLnBridgeRelayInfos,
    refetch,
  };
}
