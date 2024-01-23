import { BaseBridge } from "./base";
import { Address, Hex, TransactionReceipt, bytesToHex, encodeFunctionData } from "viem";
import { BridgeConstructorArgs, GetFeeArgs, TransferOptions } from "@/types/bridge";
import { fetchMsglineFeeAndParams } from "@/utils";

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

  protected async _getLayerzeroFee(sendService: Address) {
    if (this.targetChain && this.sourcePublicClient) {
      const [nativeFee, _zroFee] = await this.sourcePublicClient.readContract({
        address: sendService,
        abi: (await import(`../abi/lnaccess-controller`)).default,
        functionName: "fee",
        args: [BigInt(this.targetChain.id), bytesToHex(Uint8Array.from([123]), { size: 500 })],
      });
      return nativeFee;
    }
  }

  protected async _getMsglineFeeAndParams(message: Hex, sender: Address | null | undefined) {
    const sourceMessager = this.sourceChain?.messager?.msgline;
    const targetMessager = this.targetChain?.messager?.msgline;

    if (sender && sourceMessager && targetMessager && this.contract && this.sourceChain && this.sourceNativeToken) {
      const payload = encodeFunctionData({
        abi: (await import("@/abi/msgline-messager")).default,
        functionName: "receiveMessage",
        args: [BigInt(this.sourceChain.id), this.contract.sourceAddress, this.contract.targetAddress, message],
      });

      return fetchMsglineFeeAndParams(
        this.sourceChain.id,
        this.targetChain.id,
        sourceMessager,
        targetMessager,
        sender,
        payload,
      );
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
