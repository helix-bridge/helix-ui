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
    $bridges: [String]
  ) {
    historyRecords(
      row: $row
      page: $page
      sender: $sender
      recipient: $recipient
      results: $results
      fromChains: $fromChains
      toChains: $toChains
      bridges: $bridges
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
        bridge
      }
    }
  }
`;

export const GQL_QUERY_LNBRIDGE_RELAY_INFOS = gql`
  query queryLnBridgeRelayInfos(
    $fromChain: String
    $toChain: String
    $relayer: String
    $row: Int
    $page: Int
    $version: String
  ) {
    queryLnBridgeRelayInfos(
      fromChain: $fromChain
      toChain: $toChain
      relayer: $relayer
      row: $row
      page: $page
      version: $version
    ) {
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
        transferLimit
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
  query checkLnBridgeExist($fromChainId: Int, $toChainId: Int, $fromToken: String, $toToken: String, $version: String) {
    checkLnBridgeExist(
      fromChainId: $fromChainId
      toChainId: $toChainId
      fromToken: $fromToken
      toToken: $toToken
      version: $version
    )
  }
`;

export const GQL_GET_LN_BRIDGE_MESSAGE_CHANNEL = gql`
  query GetLnBridgeMessageChannel($bridge: String = "", $fromChain: String = "", $toChain: String = "") {
    queryLnBridgeRelayInfos(row: 1, page: 0, bridge: $bridge, fromChain: $fromChain, toChain: $toChain) {
      records {
        messageChannel
      }
    }
  }
`;

export const GQL_GET_WITHDRAWABLE_LIQUIDITIES = gql`
  query GetWithdrawableLiquidities(
    $page: Int!
    $relayer: String = ""
    $recvTokenAddress: String = ""
    $fromChain: String = ""
    $toChain: String = ""
  ) {
    historyRecords(
      row: 10
      page: $page
      relayer: $relayer
      recvTokenAddress: $recvTokenAddress
      fromChains: [$fromChain]
      toChains: [$toChain]
      needWithdrawLiquidity: true
    ) {
      total
      records {
        id
        sendAmount
        lastRequestWithdraw
      }
    }
  }
`;
