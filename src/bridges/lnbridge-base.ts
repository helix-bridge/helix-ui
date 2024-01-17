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
    if (
      args?.relayer &&
      this.contract &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken &&
      this.sourcePublicClient
    ) {
      const value = await this.sourcePublicClient.readContract({
        address: this.contract.sourceAddress,
        abi: (await import("@/abi/lnv2-default")).default,
        functionName: "totalFee",
        args: [
          BigInt(this.targetChain.id),
          args.relayer,
          this.sourceToken.address,
          this.targetToken.address,
          args.transferAmount ?? 0n,
        ],
      });
      return { value, token: this.sourceToken };
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
