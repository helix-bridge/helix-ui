import BN from 'bn.js';

export interface TxValidation {
  balance: BN;
  dailyLimit?: BN | null;
  allowance?: BN | null;
  feeTokenBalance?: BN | null;
  fee?: BN | null;
  minAmount?: BN;
  decimals?: number;
}
