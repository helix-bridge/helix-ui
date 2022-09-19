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

export const HISTORY_RECORDS = `
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

export const HISTORY_RECORDS_IN_RESULTS = `
  query historyRecords($row: Int!, $page: Int!, $sender: String, $results: [Int]) {
    historyRecords(row: $row, page: $page, sender: $sender, results: $results) {
      total
      records {
        sendAmount
        recvAmount
        bridge
        endTime
        fee
        feeToken
        fromChain
        guardSignatures
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
      }
    }
  }
`;

export const HISTORY_RECORD_BY_ID = `
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
      sendTokenAddress
    }
  }
`;

export const STATUS_STATISTICS = `
  query historyRecords($sender: String, $results: [Int!]) {
    historyRecords(sender: $sender, results: $results) {
      total
    }
  }
`;
