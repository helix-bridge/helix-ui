import { BaseBridge } from "./base";
import { Address, Hex, PublicClient, TransactionReceipt, bytesToHex, encodeFunctionData } from "viem";
import { BridgeConstructorArgs, GetFeeArgs, TransferOptions } from "@/types/bridge";
import { fetchMsglineFeeAndParams } from "@/utils";
import { ChainConfig, Token } from "@/types";

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

  protected async _getLayerzeroFee(sendService: Address, remoteChain: ChainConfig, localPublicClient: PublicClient) {
    const [nativeFee, _zroFee] = await localPublicClient.readContract({
      address: sendService,
      abi: (await import(`../abi/lnaccess-controller`)).default,
      functionName: "fee",
      args: [BigInt(remoteChain.id), bytesToHex(Uint8Array.from([123]), { size: 500 })],
    });
    return nativeFee;
  }

  protected async _getMsglineFeeAndParams(
    message: Hex,
    sender: Address,
    localChain: ChainConfig,
    remoteChain: ChainConfig,
    localContract: Address,
    remoteContract: Address,
  ) {
    const localMessager = localChain?.messager?.msgline;
    const remoteMessager = remoteChain?.messager?.msgline;

    if (sender && localMessager && remoteMessager && localContract && remoteContract) {
      const payload = encodeFunctionData({
        abi: (await import("@/abi/msgline-messager")).default,
        functionName: "receiveMessage",
        args: [BigInt(localChain.id), localContract, remoteContract, message],
      });

      return fetchMsglineFeeAndParams(localChain.id, remoteChain.id, localMessager, remoteMessager, sender, payload);
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
