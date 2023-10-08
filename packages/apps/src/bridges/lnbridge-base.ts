import { Network } from "@/types/chain";
import { BaseBridge } from "./base";
import { TransactionReceipt } from "viem";
import { TokenSymbol } from "@/types/token";
import { BridgeCategory } from "@/types/bridge";
import { PublicClient, WalletClient } from "wagmi";
import { getChainConfig } from "@/utils/chain";

export class LnBridgeBase extends BaseBridge {
  constructor(args: {
    category: BridgeCategory;

    sourceChain?: Network;
    targetChain?: Network;
    sourceToken?: TokenSymbol;
    targetToken?: TokenSymbol;

    publicClient?: PublicClient;
    walletClient?: WalletClient | null;
  }) {
    super(args);

    this.logo = {
      horizontal: "helix-horizontal.svg",
      symbol: "helix-symbol.svg",
    };
    this.name = "Helix LnBridge";
    this.estimateTime = { min: 1, max: 30 };
  }

  async getFee(args?: { baseFee?: bigint; liquidityFeeRate?: bigint; transferAmount?: bigint }) {
    const sourceChainConfig = getChainConfig(this.sourceChain);
    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);

    if (sourceTokenConfig) {
      return {
        value: (args?.baseFee || 0n) + ((args?.liquidityFeeRate || 0n) * (args?.transferAmount || 0n)) / 100000n,
        token: sourceTokenConfig,
      };
    }
    return undefined;
  }

  async transfer(
    _sender: string,
    _recipient: string,
    _amount: bigint,
    _options?: Object | undefined,
  ): Promise<TransactionReceipt | undefined> {
    return;
  }
}
