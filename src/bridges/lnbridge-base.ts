import { BaseBridge } from "./base";
import { Address, TransactionReceipt } from "viem";
import { BridgeConstructorArgs, GetFeeArgs, TransferOptions } from "@/types/bridge";

export class LnBridgeBase extends BaseBridge {
  constructor(args: BridgeConstructorArgs) {
    super(args);

    this.logo = {
      horizontal: "helix-horizontal.svg",
      symbol: "helix-symbol.svg",
    };
    this.name = "Helix LnBridge(v2)";
    this.estimateTime = { min: 1, max: 2 };
  }

  isLnBridge() {
    return true;
  }

  async getFee(args?: GetFeeArgs) {
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
    _options?: TransferOptions & { askEstimateGas?: boolean },
  ): Promise<bigint | TransactionReceipt | undefined> {
    return;
  }
}
