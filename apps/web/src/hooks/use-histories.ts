import { graphql } from "../_generated_/gql";
import { useQuery } from "@apollo/client";
import { useAccount } from "wagmi";

const document = graphql(`
  query QueryHistories($bridges: [String], $sender: String, $page: Int, $row: Int) {
    historyRecords(bridges: $bridges, sender: $sender, page: $page, row: $row) {
      total
      records {
        requestTxHash
        responseTxHash
        fromChain
        toChain
        startTime
        sendToken
        sendAmount
        confirmedBlocks
        result
        id
      }
    }
  }
`);

export function useHistories(page: number, enabled?: boolean) {
  const account = useAccount();
  const {
    loading,
    data: _data,
    refetch,
  } = useQuery(document, {
    variables: { bridges: ["lnv2-opposite", "lnv2-default", "lnv3"], sender: account.address, row: 10, page },
    fetchPolicy: "cache-and-network",
    pollInterval: enabled ? 3000 : 0,
    skip: !enabled,
  });

  return { loading, data: _data?.historyRecords, refetch };
}
