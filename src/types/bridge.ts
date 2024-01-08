import { Address, Hex } from "viem";
import { PublicClient, WalletClient } from "wagmi";
import { ChainConfig } from "./chain";
import { Token } from "./token";
import { MessageChannel } from ".";

/**
 * lpbridge-darwinia-dvm etc. are named from graphql indexer.
 */
export type LnBridgeCategory = "lnv2-default" | "lnv2-opposite" | "lnv3";
export type L2BridgeCategory = "l2arbitrumbridge-ethereum";
export type HelixLpBridgeCategory = "lpbridge-darwinia-dvm" | "lpbridge-ethereum";
export type HelixBridgeCategory =
  | "helix-sub2ethv2(lock)"
  | "helix-sub2ethv2(unlock)"
  | "helix-sub2subv21(unlock)"
  | "helix-sub2subv21(lock)";
export type XTokenBridgeCategory = "xtoken-sepolia" | "xtoken-crab-dvm";
export type BridgeCategory =
  | LnBridgeCategory
  | L2BridgeCategory
  | HelixLpBridgeCategory
  | HelixBridgeCategory
  | XTokenBridgeCategory;

export interface BridgeContract {
  sourceAddress: Address;
  targetAddress: Address;
}

export type BridgeLogoType = "symbol" | "horizontal";

export type BridgeLogo = {
  [key in BridgeLogoType]: string;
};

export interface BridgeConstructorArgs {
  walletClient?: WalletClient | null;
  publicClient?: PublicClient;
  category: BridgeCategory;

  sourceChain?: ChainConfig;
  targetChain?: ChainConfig;
  sourceToken?: Token;
  targetToken?: Token;
}

export interface GetFeeArgs {
  baseFee?: bigint;
  protocolFee?: bigint;
  liquidityFeeRate?: bigint;
  transferAmount?: bigint;
  sender?: Address;
  recipient?: Address;
}

export interface TransferOptions {
  relayer?: Address;
  transferId?: Hex | null;
  totalFee?: bigint;
  withdrawNonce?: bigint;
  depositedMargin?: bigint;
}

export interface GetWithdrawFeeArgs {
  amount: bigint;
  sender?: Address;
  relayer?: Address;
  transferId?: Hex | null;
  withdrawNonce?: string | null;
  messageChannel?: MessageChannel | null;
}
