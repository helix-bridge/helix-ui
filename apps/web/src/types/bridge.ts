import { Address, Hex } from "viem";
import { PublicClient, WalletClient } from "wagmi";
import { ChainConfig } from "./chain";
import { Token } from "./token";
import { MessageChannel } from "./graphql";
import { HelixProtocolName } from "@helixbridge/helixconf";

export type BridgeVersion = "lnv2" | "lnv3";
export type BridgeV2Type = "default" | "opposite";

export type BridgeCategory = "lnbridge" | HelixProtocolName;

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

  protocol: BridgeCategory;
}

export interface GetFeeArgs {
  baseFee?: bigint;
  protocolFee?: bigint;
  liquidityFeeRate?: bigint;
  transferAmount?: bigint;
  sender?: Address;
  recipient?: Address;
  relayer?: Address;
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
