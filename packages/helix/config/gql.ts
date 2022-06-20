import { gql } from 'graphql-request';

export const HISTORY_RECORD_BY_ID = gql`
  query historyRecordById($id: String!) {
    historyRecordById(id: $id) {
      id
      bridge
      fromChain
      toChain
      laneId
      nonce
      requestTxHash
      responseTxHash
      sender
      recipient
      token
      amount
      startTime
      endTime
      result
      fee
    }
  }
`;
