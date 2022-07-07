import { gql } from 'graphql-request';

export const ACCOUNTS = `
  query accounts($chain: String) {
    accounts(chain: $chain) {
      total
    }
  } 
`;

export const STATISTICS_QUERY = `
  query queryDailyStatistics($timepast: Int!, $chain: String) {
    queryDailyStatistics(timepast: $timepast, from: $chain) {
      dailyCount
      dailyVolume
      timestamp
    }
  }
`;

export const HISTORY_RECORDS = gql`
  query historyRecords($row: Int!, $page: Int!, $sender: String, $recipient: String) {
    historyRecords(row: $row, page: $page, sender: $sender, recipient: $recipient) {
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

export const HISTORY_RECORD_BY_ID = gql`
  query historyRecordById($id: String!) {
    historyRecordById(id: $id) {
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
`;
