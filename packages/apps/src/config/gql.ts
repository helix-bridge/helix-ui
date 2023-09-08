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
