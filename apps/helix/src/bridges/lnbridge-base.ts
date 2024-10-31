import { BaseBridge } from "./base";
import { Address, Hex, PublicClient, TransactionReceipt, bytesToHex, encodeFunctionData } from "viem";
import { BridgeConstructorArgs, GetFeeArgs, GetWithdrawFeeArgs, TransferOptions } from "../types/bridge";
import { fetchMsglineFeeAndParams } from "../utils";
import { ChainConfig, Token } from "../types";
import { HelixChain } from "@helixbridge/helixconf";

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
        abi: (await import("../abi/lnv2-default")).default,
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
    const [nativeFee] = await localPublicClient.readContract({
      address: sendService,
      abi: (await import(`../abi/lnaccess-controller`)).default,
      functionName: "fee",
      args: [BigInt(remoteChain.id), bytesToHex(Uint8Array.from([123]), { size: 750 })],
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
    localToken: Token | undefined,
    remoteToken: Token | undefined,
  ) {
    // const localMessager = localChain?.messager?.msgline;
    // const remoteMessager = remoteChain?.messager?.msgline;

    const localMessager = HelixChain.chains()
      .find((c) => c.id.toString() === localChain.id.toString())
      ?.messager("msgline")?.address as Address | undefined;
    const rm = HelixChain.chains()
      .find((c) => c.id.toString() === localChain.id.toString())
      ?.couples.find(
        (c) =>
          c.chain.code === remoteChain.network &&
          c.symbol.from === localToken?.symbol &&
          c.symbol.to === remoteToken?.symbol &&
          c.protocol.name === this.protocol,
      )?.messager;
    const remoteMessager = rm?.name === "msgline" ? (rm.address as Address | undefined) : undefined;

    if (sender && localMessager && remoteMessager && localContract && remoteContract) {
      const payload = encodeFunctionData({
        abi: (await import("../abi/msgline-messager")).default,
        functionName: "receiveMessage",
        args: [BigInt(localChain.id), localContract, remoteContract, message],
      });

      return fetchMsglineFeeAndParams(localChain.id, remoteChain.id, localMessager, remoteMessager, sender, payload);
    }
  }

  private async _getLayerzeroWithdrawFee() {
    if (this.contract && this.targetChain && this.sourceNativeToken && this.sourcePublicClient) {
      const [sendService] = await this.sourcePublicClient.readContract({
        address: this.contract.sourceAddress,
        abi: (await import(`../abi/lnv2-default`)).default,
        functionName: "messagers",
        args: [BigInt(this.targetChain.id)],
      });
      const value = await this._getLayerzeroFee(sendService, this.targetChain, this.sourcePublicClient);
      return typeof value === "bigint" ? { value, token: this.sourceNativeToken, params: undefined } : undefined;
    }
  }

  private async _getMsglineWithdrawFeeAndParams(args: GetWithdrawFeeArgs) {
    if (
      this.sourceChain &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken &&
      this.contract &&
      this.sourceNativeToken &&
      args.transferId &&
      args.withdrawNonce &&
      args.relayer &&
      args.sender
    ) {
      const message = encodeFunctionData({
        abi: (await import(`../abi/lnv2-default`)).default,
        functionName: "withdraw",
        args: [
          BigInt(this.sourceChain.id),
          args.transferId,
          BigInt(args.withdrawNonce),
          args.relayer,
          this.sourceToken.address,
          this.targetToken.address,
          args.amount,
        ],
      });
      const feeAndParams = await this._getMsglineFeeAndParams(
        message,
        args.sender,
        this.sourceChain,
        this.targetChain,
        this.contract.sourceAddress,
        this.contract.targetAddress,
        this.sourceToken,
        this.targetToken,
      );
      return feeAndParams
        ? { value: feeAndParams.fee, token: this.sourceNativeToken, params: feeAndParams.extParams }
        : undefined;
    }
  }

  async getWithdrawFeeParams(args: GetWithdrawFeeArgs) {
    if (args.messageChannel === "layerzero") {
      return this._getLayerzeroWithdrawFee();
    } else if (args.messageChannel === "msgline") {
      return this._getMsglineWithdrawFeeAndParams(args);
    }
  }

  protected async _transfer(
    _sender: Address,
    _recipient: Address,
    _amount: bigint,
    _options?: TransferOptions & { askEstimateGas?: boolean },
  ): Promise<bigint | TransactionReceipt | undefined> {
    void _sender, _recipient, _amount, _options;
    return;
  }
}
