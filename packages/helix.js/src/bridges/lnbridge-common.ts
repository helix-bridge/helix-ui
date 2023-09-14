import { getChainConfig } from "..";
import type { BridgeCategory, BridgeContract, Network, TokenSymbol } from "../types";
import { BaseBridge } from "./base";
import { PublicClient, WalletClient } from "viem";

export class LnBridgeCommon extends BaseBridge {
  constructor(args: {
    sourceChain: Network;
    targetChain: Network;
    sourceToken: TokenSymbol;
    targetToken: TokenSymbol;
    publicClient: PublicClient;
    walletClient: WalletClient;
    category: BridgeCategory;
  }) {
    super({
      sourceChain: args.sourceChain,
      targetChain: args.targetChain,
      sourceToken: args.sourceToken,
      targetToken: args.targetToken,
      publicClient: args.publicClient,
      walletClient: args.walletClient,
      category: args.category,
    });
  }

  getEstimateTime(): string | undefined {
    return "1-30 Minutes";
  }

  getName(): string {
    return "Helix LnBridge";
  }

  getContract(): BridgeContract | undefined {
    return getChainConfig(this.sourceChain)?.crossChain[this.targetChain]?.[this.category]?.bridgeContract;
  }

  async getFee(baseFee: bigint, liquidityFeeRate: bigint, sendAmount: bigint): Promise<bigint | undefined> {
    return baseFee + (liquidityFeeRate * sendAmount) / 100000n;
  }
}
