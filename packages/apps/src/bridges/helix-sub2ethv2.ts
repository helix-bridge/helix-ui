import { BridgeCategory, BridgeContract } from "@/types/bridge";
import { BaseBridge } from "./base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { TransactionReceipt } from "viem";

export class HelixSub2ethv2 extends BaseBridge {
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
    this.name = "Helix";
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
