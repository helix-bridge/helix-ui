import { ApolloClient } from "@apollo/client";
import { Dispatch, SetStateAction } from "react";
import { Hex, TransactionReceipt } from "viem";
import { ChainConfig, Token } from "../../types";
import { LnBridgeV3 } from "../../bridges";

export interface RelayerCtx {
  bridgeInstance: LnBridgeV3;
  sourceChain: ChainConfig | undefined;
  targetChain: ChainConfig | undefined;
  sourceToken: Token | undefined;
  targetToken: Token | undefined;
  penaltyReserve: bigint | undefined;
  sourceAllowance: { value: bigint; token: Token } | undefined;
  targetAllowance: { value: bigint; token: Token } | undefined;
  sourceBalance: { value: bigint; token: Token } | undefined;
  targetBalance: { value: bigint; token: Token } | undefined;
  isGettingPenaltyReserves: boolean;

  setSourceChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setTargetChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setSourceToken: Dispatch<SetStateAction<Token | undefined>>;
  // setBaseFee: Dispatch<SetStateAction<bigint | undefined>>;
  // setFeeRate: Dispatch<SetStateAction<number | undefined>>;
  // setPenaltyReserve: Dispatch<SetStateAction<bigint | undefined>>;
  // setSourceAllowance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  // setSourceBalance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  // setTargetBalance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;

  sourceApprove: (amount: bigint) => Promise<TransactionReceipt | undefined>;
  targetApprove: (amount: bigint) => Promise<TransactionReceipt | undefined>;
  depositPenaltyReserve: (amount: bigint) => Promise<TransactionReceipt | undefined>;
  registerLnProvider: (
    baseFee: bigint,
    feeRate: number,
    transferLimit: bigint,
  ) => Promise<TransactionReceipt | undefined>;
  isLnBridgeExist: (apolloClient: ApolloClient<object>) => Promise<boolean>;
  withdrawPenaltyReserve: (amount: bigint) => Promise<TransactionReceipt | undefined>;
  withdrawLiquidity: (
    ids: { id: string }[],
    messageFee: bigint,
    params: Hex | undefined,
  ) => Promise<TransactionReceipt | undefined>;
}
