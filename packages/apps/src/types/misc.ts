import { Address, Hex } from "viem";

export interface InputValue<T = unknown> {
  input: string;
  value: T;
  valid: false;
}

export interface TransferOptions {
  relayer?: Address;
  transferId?: Hex | null;
  totalFee?: bigint;
  withdrawNonce?: bigint;
  depositedMargin?: bigint;
}
