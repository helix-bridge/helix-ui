import { BridgeConstructorArgs, TransferOptions } from "@/types";
import { BaseBridge } from ".";
import { Address, TransactionReceipt } from "viem";

export class XTokenV3Bridge extends BaseBridge {
  constructor(args: BridgeConstructorArgs) {
    super(args);

    this.logo = {
      horizontal: "helix-horizontal.svg",
      symbol: "helix-symbol.svg",
    };
    this.name = "XTokenV3";
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
