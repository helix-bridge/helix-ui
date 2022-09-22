import BN from 'bn.js';

export interface TxValidation {
  balance: BN;
  amount: BN;
  dailyLimit?: BN;
  allowance?: BN;
  feeTokenBalance?: BN;
  fee?: BN;
  decimals?: number;
}
