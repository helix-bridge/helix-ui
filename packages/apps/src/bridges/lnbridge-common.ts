import { Network } from "@/types/chain";
import { BaseBridge } from "./base";
import { TransactionReceipt } from "viem";
import { TokenSymbol } from "@/types/token";
import { BridgeCategory, BridgeContract } from "@/types/bridge";
import { PublicClient, WalletClient } from "wagmi";

export class LnBridgeCommon extends BaseBridge {
  constructor(args: {
    category: BridgeCategory;
    contract?: BridgeContract;

    sourceChain?: Network;
    targetChain?: Network;
    sourceToken?: TokenSymbol;
    targetToken?: TokenSymbol;

    publicClient?: PublicClient;
    walletClient?: WalletClient | null;
  }) {
    super(args);

    this.logo = {
      horizontal: "lnbridge-horizontal.svg",
      symbol: "lnbridge-symbol.svg",
    };
    this.name = "Helix LnBridge";
  }

  getEstimateTime(): string {
    return "1-30 Minutes";
  }

  async getFee(baseFee: bigint, liquidityFeeRate: bigint, sendAmount: bigint): Promise<bigint | undefined> {
    return baseFee + (liquidityFeeRate * sendAmount) / 100000n;
  }

  async transfer(
    sender: string,
    receiver: string,
    amount: bigint,
    options?: Object | undefined,
  ): Promise<TransactionReceipt | undefined> {
    return;
  }
}
