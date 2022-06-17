/// <reference types="jest" />

import { gqlName } from '../../utils/helper';

describe('common utils', () => {
  it('can extract gql name', () => {
    const historyRecords = `
        query historyRecords($row: Int!, $page: Int!, $sender: String, $recipient: String) {
                historyRecords(row: $row, page: $page, sender: $sender, recipient: $recipient) {
                        total
                }
        }
        `;
    const unlockRecord = `
        query unlockRecord($id: ID!) {
                unlockRecord(id: $id) {
                        id
                }
              }
        `;

    expect(gqlName(historyRecords)).toEqual('historyRecords');
    expect(gqlName(unlockRecord)).toEqual('unlockRecord');
  });
});
