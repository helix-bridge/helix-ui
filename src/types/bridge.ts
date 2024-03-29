import { Address, Hex } from "viem";
import { PublicClient, WalletClient } from "wagmi";
import { ChainConfig } from "./chain";
import { Token } from "./token";

/**
 * `lpbridge-darwinia-dvm` etc. are named from graphql indexer.
 */
export type L2BridgeCategory = "l2arbitrumbridge-ethereum";
export type HelixLpBridgeCategory = "lpbridge-darwinia-dvm" | "lpbridge-ethereum";
export type HelixBridgeCategory =
  | "helix-sub2ethv2(lock)"
  | "helix-sub2ethv2(unlock)"
  | "helix-sub2subv21(unlock)"
  | "helix-sub2subv21(lock)";
export type XTokenBridgeCategory =
  | "xtoken-sepolia"
  | "xtoken-ethereum"
  | "xtoken-darwinia-dvm"
  | "xtoken-crab-dvm"
  | "xtoken-pangolin-dvm";
export type BridgeCategory = L2BridgeCategory | HelixLpBridgeCategory | HelixBridgeCategory | XTokenBridgeCategory;

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
  transferAmount?: bigint;
  sender?: Address;
  recipient?: Address;
  relayer?: Address;
}

export interface TransferOptions {
  relayer?: Address;
  transferId?: Hex | null;
  totalFee?: bigint;
}
