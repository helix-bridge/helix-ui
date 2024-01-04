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

export const GQL_SORTED_LNBRIDGE_RELAY_INFOS = gql`
  query sortedLnBridgeRelayInfos(
    $amount: String
    $decimals: Int
    $bridge: String
    $token: String
    $fromChain: String
    $toChain: String
  ) {
    sortedLnBridgeRelayInfos(
      amount: $amount
      decimals: $decimals
      bridge: $bridge
      token: $token
      fromChain: $fromChain
      toChain: $toChain
    ) {
      transferLimit
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

export const GQL_QUERY_LNBRIDGE_RELAY_INFOS = gql`
  query queryLnBridgeRelayInfos($fromChain: String, $toChain: String, $relayer: String, $row: Int, $page: Int) {
    queryLnBridgeRelayInfos(fromChain: $fromChain, toChain: $toChain, relayer: $relayer, row: $row, page: $page) {
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
