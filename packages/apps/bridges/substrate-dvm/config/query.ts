/**
 * subql
 */
export const SUBSTRATE_TO_DVM_QUERY = `
  query transfers($account: String!, $method: String!, $offset: Int, $limit: Int) {
    transfers(
      offset: $offset,
      first: $limit,
      filter: {
        and: [
          {
            senderId: {
              equalTo: $account
            }
          },
          { method: { equalTo: $method } }
        ]
      },
      orderBy: TIMESTAMP_DESC
    ){
      totalCount
      nodes {
        recipientId
        senderId
        amount
        timestamp
        section
        method
        block
      }
    }
  }
`;

export const DVM_TO_SUBSTRATE_QUERY = `
  query transfers(
    $account: String!
    $offset: Int
    $limit: Int
  ) {
    transfers(
      offset: $offset
      first: $limit
      filter: {
        and: [{ senderId: { equalTo: $account } }, { method: {in: ["DVMTransfer", "KtonDVMTransfer"]} }]
      }
      orderBy: TIMESTAMP_DESC
    ) {
      totalCount
      nodes {
        recipientId
        senderId
        amount
        timestamp
        section
        method
        block
      }
    }
  }
`;
