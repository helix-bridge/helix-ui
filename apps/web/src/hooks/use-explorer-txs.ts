import { graphql } from "../_generated_/gql";
import { useQuery } from "@apollo/client";

const document = graphql(`
  query QueryExplorerTxs($bridges: [String], $sender: String, $page: Int, $row: Int) {
    historyRecords(bridges: $bridges, sender: $sender, page: $page, row: $row) {
      total
      records {
        id
        fromChain
        toChain
        sender
        recipient
        sendAmount
        sendToken
        startTime
        result
        confirmedBlocks
      }
    }
  }
`);

export function useExplorerTxs(sender: string, page: number, row = 10) {
  const {
    loading,
    data: _data,
    networkStatus,
    refetch,
  } = useQuery(document, {
    variables: { sender, bridges: ["lnv3", "lnv2-default", "lnv2-opposite"], page, row },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  return {
    loading,
    data: _data?.historyRecords,
    networkStatus,
    refetch,
  };
}
