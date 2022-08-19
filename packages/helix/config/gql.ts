import { gql } from 'graphql-request';

export const ACCOUNTS = `
  query accounts($chain: String) {
    accounts(chain: $chain) {
      total
    }
  } 
`;

export const STATISTICS_QUERY = `
  query queryDailyStatistics($timepast: Int!) {
    queryDailyStatistics(timepast: $timepast) {
      timestamp
      token
      fromChain
      toChain
      dailyVolume
      dailyCount
    }
  }
`;

export const HISTORY_RECORDS = gql`
  query historyRecords($row: Int!, $page: Int!, $sender: String, $recipient: String) {
    historyRecords(row: $row, page: $page, sender: $sender, recipient: $recipient) {
      total
      records {
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
      }
    }
  }
`;

export const HISTORY_RECORD_BY_ID = gql`
  query historyRecordById($id: String!) {
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
    }
  }
`;
