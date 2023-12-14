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

    this.initContract();
  }

  private initContract() {
    const backing = "0xb137BDf1Ad5392027832f54a4409685Ef52Aa9dA";
    const issuing = "0x44A001aF6AcD2d5f5cB82FCB14Af3d497D56faB4";
    this.initContractByBackingIssuing(backing, issuing);
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
