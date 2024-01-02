import { gql } from "@apollo/client";

export const GQL_HISTORY_RECORDS = gql`
  query historyRecords(
    $row: Int!
    $page: Int!
    $sender: String
    $recipient: String
    $results: [Int]
    $fromChains: [String]
    $toChains: [String]
  ) {
    historyRecords(
      row: $row
      page: $page
      sender: $sender
      recipient: $recipient
      results: $results
      fromChains: $fromChains
      toChains: $toChains
    ) {
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

export const GQL_HISTORY_RECORD_BY_ID = gql`
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

export const GQL_SORTED_LNV20_RELAY_INFOS = gql`
  query sortedLnv20RelayInfos(
    $amount: String
    $decimals: Int
    $bridge: String
    $token: String
    $fromChain: String
    $toChain: String
  ) {
    sortedLnv20RelayInfos(
      amount: $amount
      decimals: $decimals
      bridge: $bridge
      token: $token
      fromChain: $fromChain
      toChain: $toChain
    ) {
      maxMargin
      records {
        sendToken
        relayer
        margin
        baseFee
        protocolFee
        liquidityFeeRate
        lastTransferId
        withdrawNonce
      }
    }
  }
`;

export const GQL_QUERY_LNV20_RELAY_INFOS = gql`
  query queryLnv20RelayInfos($fromChain: String, $toChain: String, $relayer: String, $row: Int, $page: Int) {
    queryLnv20RelayInfos(fromChain: $fromChain, toChain: $toChain, relayer: $relayer, row: $row, page: $page) {
      total
      records {
        id
        fromChain
        toChain
        bridge
        relayer
        sendToken
        margin
        baseFee
        liquidityFeeRate
        cost
        profit
        heartbeatTimestamp
        messageChannel
        lastTransferId
        withdrawNonce
      }
    }
  }
`;

export const GQL_HISTORY_RECORD_BY_TX_HASH = gql`
  query historyRecordByTxHash($txHash: String) {
    historyRecordByTxHash(txHash: $txHash) {
      confirmedBlocks
      result
      id
    }
  }
`;

export const GQL_CHECK_LNBRIDGE_EXIST = gql`
  query checkLnBridgeExist($fromChainId: Int, $toChainId: Int, $fromToken: String, $toToken: String) {
    checkLnBridgeExist(fromChainId: $fromChainId, toChainId: $toChainId, fromToken: $fromToken, toToken: $toToken)
  }
`;
