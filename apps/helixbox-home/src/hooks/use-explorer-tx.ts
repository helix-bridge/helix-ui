import { useQuery } from "@apollo/client";
import { graphql } from "../_generated_/gql";

const document = graphql(`
  query ExplorerTxById($id: String!) {
    historyRecordById(id: $id) {
      sendAmount
      recvAmount
      bridge
      endTime
      fee
      feeToken
      fromChain
      id
      nonce
      messageNonce
      recipient
      requestTxHash
      responseTxHash
      reason
      result
      sender
      startTime
      toChain
      sendToken
      recvToken
      sendTokenAddress
      recvTokenAddress
      relayer
    }
  }
`);

export function useExplorerTx(id: string) {
  const { data, loading, refetch } = useQuery(document, {
    variables: { id },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  return { data, loading, refetch };
}
