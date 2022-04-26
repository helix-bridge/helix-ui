interface Transfer {
  amount: string;
  senderId: string;
  timestamp: string;
  recipientId: string;
  section: 'kton' | 'balances';
  method: string;
  // eslint-disable-next-line id-denylist
  block: { blockHash: string; number: number; specVersion: number };
}

export interface Substrate2DVMRecordsRes {
  transfers: {
    totalCount: number;
    nodes: Transfer[];
  };
}

export type DVM2SubstrateRecordsRes = Substrate2DVMRecordsRes;

export type Substrate2DVMRecord = Transfer;

export type DVM2SubstrateRecord = Transfer;
