import { ChainConfig } from "@/types/chain";
import { BaseBridge } from "./base";
import { Address, TransactionReceipt } from "viem";
import { Token } from "@/types/token";
import { BridgeCategory, BridgeLogo, TransferOptions } from "@/types/bridge";
import { PublicClient, WalletClient } from "wagmi";

export class LnBridgeBase extends BaseBridge {
  constructor(args: {
    walletClient?: WalletClient | null;
    publicClient?: PublicClient;
    category: BridgeCategory;
    logo?: BridgeLogo;

    sourceChain?: ChainConfig;
    targetChain?: ChainConfig;
    sourceToken?: Token;
    targetToken?: Token;
  }) {
    super(args);

    this.logo = args.logo ?? {
      horizontal: "helix-horizontal.svg",
      symbol: "helix-symbol.svg",
    };
    this.name = "Helix LnBridge";
    this.estimateTime = { min: 1, max: 2 };
  }

  isLnBridge() {
    return true;
  }

  async getFee(args?: { baseFee?: bigint; protocolFee?: bigint; liquidityFeeRate?: bigint; transferAmount?: bigint }) {
    if (this.sourceToken) {
      return {
        value:
          (args?.baseFee || 0n) +
          (args?.protocolFee || 0n) +
          ((args?.liquidityFeeRate || 0n) * (args?.transferAmount || 0n)) / 100000n,
        token: this.sourceToken,
      };
    }
  }

  protected async _transfer(
    _sender: Address,
    _recipient: Address,
    _amount: bigint,
    _options?: TransferOptions & { estimateGas?: boolean },
  ): Promise<bigint | TransactionReceipt | undefined> {
    return;
  }
}
