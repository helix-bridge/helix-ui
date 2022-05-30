/**
 * subgraph
 */
export const S2S_REDEEM_RECORDS_QUERY = `
  query burnRecordEntities($account: String!, $offset: Int, $limit: Int, $result: [Int!] ) {
    burnRecordEntities(
      skip: $offset,
      first: $limit,
      where: { 
        sender: $account,
        result_in: $result
      }, 
      orderBy: start_timestamp,
      orderDirection: desc
    ){
      amount
      end_timestamp
      lane_id
      nonce
      recipient
      request_transaction
      response_transaction
      result
      sender
      start_timestamp
      token
    }
  }
`;

/**
 * subgraph
 */
export const S2S_REDEEM_RECORD_QUERY = `
  query burnRecordEntity($id: String!) {
    burnRecordEntity(id: $id) {
      amount
      end_timestamp     
      lane_id
      nonce
      recipient
      request_transaction
      response_transaction
      result
      sender
      start_timestamp
      token
    }
  }
`;

/**
 * subql
 */
export const S2S_ISSUING_RECORDS_QUERY = `
  query s2sEvents($account: String!, $offset: Int!, $limit: Int!, $result: [Int!]) {
    s2sEvents(offset: $offset, first: $limit, filter: { senderId: { equalTo: $account }, result: { in: $result } }, orderBy: START_TIMESTAMP_DESC) {
      totalCount
      nodes {
        amount
        endTimestamp
        id
        laneId
        nonce
        recipient
        requestTxHash
        responseTxHash
        result
        senderId
        startTimestamp
        token
      }
    }
  }
`;

/**
 * subql
 */
export const S2S_ISSUING_RECORD_QUERY = `
  query s2sEvent($id: String!) {
    s2sEvent(id: $id) {
      amount
      endTimestamp
      id
      recipient
      requestTxHash
      responseTxHash
      result
      sender
      startTimestamp
      token
    }
  }
`;

/**
 * subql
 */
export const BRIDGE_DISPATCH_EVENTS = `
  query bridge_dispatch_events($id: String!) {
    bridgeDispatchEvent(id: $id) {
      data
      method
      block
      index
    }
  }
`;
