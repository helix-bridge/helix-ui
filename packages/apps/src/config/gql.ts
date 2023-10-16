import { gql } from "@apollo/client";

export const QUERY_RECORDS = gql`
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

export const QUERY_RECORD_BY_ID = gql`
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

export const QUERY_RELAYERS = gql`
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
`;

export const QUERY_LNRELAYERS = gql`
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
      }
    }
  }
`;

export const QUERY_SPECIAL_RELAYER = gql`
  query queryLnv20RelayInfos($fromChain: String, $toChain: String, $bridge: String, $relayer: String) {
    queryLnv20RelayInfos(fromChain: $fromChain, toChain: $toChain, bridge: $bridge, relayer: $relayer) {
      total
      records {
        sendToken
      }
    }
  }
`;
