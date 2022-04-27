import { Network } from 'shared/model';

interface DarwiniaListRes<T> {
  count: number;
  list: T[];
}

export interface Ethereum2DarwiniaRecord {
  address: string;
  amount: string;
  block_num: number;
  block_timestamp: number;
  chain: Network;
  created_at: string;
  currency: string;
  target: string;
  tx: string;
}
export interface Ethereum2DarwiniaRingBurnRecord extends Ethereum2DarwiniaRecord {
  id: number;
}

export type Ethereum2DarwiniaRingBurnHistoryRes<R = Ethereum2DarwiniaRingBurnRecord> = DarwiniaListRes<R>;

export interface Ethereum2DarwiniaRedeemRecord extends Ethereum2DarwiniaRecord {
  darwinia_tx: string;
  deposit: string; // json string
  is_relayed: boolean;
}

export type Ethereum2DarwiniaRedeemHistoryRes<R = Ethereum2DarwiniaRedeemRecord> = DarwiniaListRes<R>;

export interface Darwinia2EthereumRecord {
  account_id: string;
  block_hash: string;
  block_header: string;
  block_num: number;
  block_timestamp: number;
  extrinsic_index: string;
  kton_value: string;
  mmr_index: number;
  mmr_root: string;
  ring_value: string;
  signatures: string;
  target: string;
  tx: string;
}

export type Darwinia2EthereumHistoryRes<R = Darwinia2EthereumRecord> = DarwiniaListRes<R> & {
  implName: string;
  best: number;
  MMRRoot: string;
};

export type Darwinia2EthereumMeta = Pick<Darwinia2EthereumHistoryRes, 'best' | 'MMRRoot'>;
