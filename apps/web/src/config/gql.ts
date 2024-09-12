import { gql } from "@apollo/client";

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
    $row: Int!
    $page: Int!
    $relayer: String = ""
    $recvTokenAddress: String = ""
    $fromChain: String = ""
    $toChain: String = ""
  ) {
    historyRecords(
      row: $row
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

export const GQL_GET_SUPPORTED_CHAINS = gql`
  query GetSupportedChains($tokenKey: String!) {
    queryLnBridgeSupportedChains(tokenKey: $tokenKey) {
      tokenKey
      chains {
        fromChain
        toChains
      }
    }
  }
`;

export const GQL_GET_MAX_TRANSFER = gql`
  query GetMaxTransfer($token: String, $balance: String, $fromChain: String, $toChain: String) {
    queryMaxTransfer(token: $token, balance: $balance, fromChain: $fromChain, toChain: $toChain)
  }
`;

export const GQL_GET_HISTORY = gql`
  query GetHistory($bridges: [String], $sender: String, $page: Int, $row: Int) {
    historyRecords(bridges: $bridges, sender: $sender, page: $page, row: $row) {
      total
      records {
        requestTxHash
        responseTxHash
        fromChain
        toChain
        startTime
        sendToken
        sendAmount
        confirmedBlocks
        result
        id
      }
    }
  }
`;

export const GQL_GET_HISTORY_DETAILS = gql`
  query GetHistoryDetails($txHash: String) {
    historyRecordByTxHash(txHash: $txHash) {
      requestTxHash
      responseTxHash
      fromChain
      toChain
      startTime
      sendToken
      sendAmount
      confirmedBlocks
      result
      id
    }
  }
`;

export const GQL_GET_TXS = gql`
  query GetTXS($bridges: [String], $sender: String, $page: Int, $row: Int) {
    historyRecords(bridges: $bridges, sender: $sender, page: $page, row: $row) {
      total
      records {
        id
        fromChain
        toChain
        sender
        recipient
        sendAmount
        sendToken
        startTime
        result
        confirmedBlocks
      }
    }
  }
`;

export const GQL_GET_RELAYERS = gql`
  query GetRelayers($fromChain: String, $toChain: String, $relayer: String, $version: String, $page: Int, $row: Int) {
    queryLnBridgeRelayInfos(
      fromChain: $fromChain
      toChain: $toChain
      relayer: $relayer
      version: $version
      page: $page
      row: $row
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
        signers
      }
    }
  }
`;
