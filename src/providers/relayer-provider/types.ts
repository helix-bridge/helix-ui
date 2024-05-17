import { Dispatch, SetStateAction } from "react";
import { BaseBridge, LnBridgeV2Default, LnBridgeV2Opposite } from "../../bridges";
import { BridgeCategory, ChainConfig, InputValue, Token } from "../../types";
import { Address, TransactionReceipt } from "viem";
import { ApolloClient } from "@apollo/client";

export interface RelayerCtx {
  margin: bigint | undefined;
  baseFee: bigint | undefined;
  feeRate: number | undefined;
  sourceAllowance: { value: bigint; token: Token } | undefined;
  targetAllowance: { value: bigint; token: Token } | undefined;
  sourceBalance: { value: bigint; token: Token } | undefined;
  targetBalance: { value: bigint; token: Token } | undefined;
  sourceChain: ChainConfig | undefined;
  targetChain: ChainConfig | undefined;
  sourceToken: Token | undefined;
  targetToken: Token | undefined;
  bridgeCategory: BridgeCategory | undefined;
  defaultBridge: LnBridgeV2Default | undefined;
  oppositeBridge: LnBridgeV2Opposite | undefined;
  withdrawAmount: InputValue<bigint>;

  setMargin: Dispatch<SetStateAction<bigint | undefined>>;
  setBaseFee: Dispatch<SetStateAction<bigint | undefined>>;
  setFeeRate: Dispatch<SetStateAction<number | undefined>>;
  setSourceAllowance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  setTargetAllowance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  setSourceBalance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  setTargetBalance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  setSourceChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setTargetChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setSourceToken: Dispatch<SetStateAction<Token | undefined>>;
  setBridgeCategory: Dispatch<SetStateAction<BridgeCategory | undefined>>;
  setWithdrawAmount: Dispatch<SetStateAction<InputValue<bigint>>>;

  sourceApprove: (
    owner: Address,
    amount: bigint,
    bridge: BaseBridge,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  targetApprove: (
    owner: Address,
    amount: bigint,
    bridge: BaseBridge,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  depositMargin: (
    relayer: Address,
    margin: bigint,
    bridge: LnBridgeV2Default,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  updateFeeAndMargin: (
    relayer: Address,
    margin: bigint,
    baseFee: bigint,
    feeRate: number,
    bridge: LnBridgeV2Opposite,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  setFeeAndRate: (
    baseFee: bigint,
    feeRate: number,
    bridge: LnBridgeV2Default,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  withdrawMargin: (
    recipient: Address,
    amount: bigint,
    fee: bigint,
    bridge: LnBridgeV2Default,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  isLnBridgeExist: (
    apolloClient: ApolloClient<object>,
    _sourceChain: ChainConfig,
    _targetChain: ChainConfig,
    _sourceToken: Token,
    _targetToken: Token,
  ) => Promise<boolean>;
}
