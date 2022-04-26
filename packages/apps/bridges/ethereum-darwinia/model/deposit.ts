/**
 * api repo: https://github.com/evolutionlandorg/evo-backend/blob/main/wiki.md
 */
export interface Deposit {
  amount: string;
  deposit_id: number;
  deposit_time: number; // timestamp
  duration: number; // month amount
}

export type DepositResponse = { list: Deposit[] };

export interface DepositRequest {
  address: string;
}
