import { gql } from 'graphql-request';

export const HISTORY_RECORDS = gql`
  query historyRecords($row: Int!, $page: Int!, $sender: String, $result: Int) {
    historyRecords(row: $row, page: $page, sender: $sender, result: $result) {
      total
      records {
        amount
        bridge
        endTime
        fee
        feeToken
        fromChain
        id
        laneId
        nonce
        recipient
        requestTxHash
        responseTxHash
        targetTxHash
        bridgeDispatchError
        result
        sender
        startTime
        toChain
        token
      }
    }
  }
`;
