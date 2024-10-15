import { useQuery } from "@apollo/client";
import { graphql } from "../_generated_/gql";

const document = graphql(`
  query QueryExplorerTxById($id: String!) {
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

export function useExplorerTx(txId: string) {
  const { data, loading, refetch } = useQuery(document, {
    variables: { id: txId },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  return { data, loading, refetch };
}
