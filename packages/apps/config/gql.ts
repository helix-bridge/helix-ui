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
  query historyRecords($row: Int!, $page: Int!, $sender: String, $recipient: String, $results: [Int], $fromChains: [String], $toChains: [String]) {
    historyRecords(row: $row, page: $page, sender: $sender, recipient: $recipient, results: $results, fromChains: $fromChains, toChains: $toChains) {
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
        confirmedBlocks
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
`;

export const STATUS_STATISTICS = `
  query historyRecords($sender: String, $results: [Int!]) {
    historyRecords(sender: $sender, results: $results) {
      total
    }
  }
`;

export const GET_RELAYERS_INFO = `
  query sortedLnv20RelayInfos($amount: String, $decimals: Int, $bridge: String, $token: String, $fromChain: String, $toChain: String) {
    sortedLnv20RelayInfos(amount: $amount, decimals: $decimals, bridge: $bridge, token: $token, fromChain: $fromChain, toChain: $toChain) {
      sendToken
      relayer
      margin
      baseFee
      liquidityFeeRate
      lastTransferId
      withdrawNonce
    }
  }
`;
