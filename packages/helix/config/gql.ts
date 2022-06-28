import { gql } from 'graphql-request';

export const ACCOUNTS = `
  query accounts($chain: String) {
    accounts(chain: $chain) {
      total
    }
  } 
`;

export const STATISTICS_QUERY = `
  query dailyStatistics($timepast: Int!, $chain: String) {
    dailyStatistics(timepast: $timepast, chain: $chain) {
      dailyCount
      dailyVolume
      id
    }
  }
`;

export const HISTORY_RECORDS = gql`
  query historyRecords($row: Int!, $page: Int!, $sender: String, $recipient: String) {
    historyRecords(row: $row, page: $page, sender: $sender, recipient: $recipient) {
      total
      records {
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
        feeToken
      }
    }
  }
`;

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

export const BURN_RECORD_QUERY = gql`
  query burnRecord($id: ID!) {
    burnRecord(id: $id) {
      amount
      endTime
      laneId
      nonce
      recipient
      requestTxHash
      responseTxHash
      result
      sender
      startTime
      token
      fee
    }
  }
`;

export const DVM_LOCK_RECORD_QUERY = gql`
  query dvmLockRecord($id: ID!) {
    dvmLockRecord(id: $id) {
      id
      laneId
      nonce
      recipient
      txHash
      amount
      token
    }
  }
`;

export const S2S_ISSUING_RECORD_QUERY = gql`
  query lockRecord($id: ID!) {
    lockRecord(id: $id) {
      id
      amount
      endTime
      nonce
      recipient
      requestTxHash
      responseTxHash
      result
      sender
      startTime
      token
      fee
    }
  }
`;

export const SUBSTRATE_UNLOCKED_RECORD_QUERY = gql`
  query unlockRecord($id: ID!) {
    unlockRecord(id: $id) {
      id
      recipient
      token
      amount
      timestamp
      txHash
      block
    }
  }
`;
