import { Address, Hash, encodeFunctionData, TransactionReceipt } from "viem";
import { ConstructorOptions, LnBridge, RelayInfo } from "./lnbridge";
import { HelixProtocolName } from "@helixbridge/helixconf";
import { Chain } from "@helixbridge/chains";

export class LnBridgeV2 extends LnBridge {
  constructor(
    fromChain: Chain,
    toChain: Chain,
    fromToken: Address,
    toToken: Address,
    protocol: HelixProtocolName,
    options?: ConstructorOptions,
  ) {
    super(fromChain, toChain, fromToken, toToken, protocol, options);
  }

  // eslint-disable-next-line no-unused-vars
  transfer(amount: bigint, recipient: Address, totalFee: bigint, relayInfo: RelayInfo): Promise<TransactionReceipt> {
    throw new Error("Method not implemented.");
  }

  async getLayerZeroWithdrawFee() {
    const [sendService] = await this.sourcePublicClient.readContract({
      address: this.sourceBridgeContract,
      abi: (await import(`./abi/lnv2-default`)).default,
      functionName: "messagers",
      args: [BigInt(this.targetChain.id)],
    });
    const [value] = await this.getLayerZeroFee(sendService, this.targetChain, this.sourcePublicClient);
    return { value, token: this.sourceNativeToken };
  }

  async getMsgportWithdrawFee(args: {
    transferId: Hash;
    withdrawNonce: string;
    relayer: Address;
    refundAddress: Address;
    amount: bigint;
  }) {
    const message = encodeFunctionData({
      abi: (await import(`./abi/lnv2-default`)).default,
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
    const feeAndParams = await this.getMsgportFeeAndParams(
      message,
      args.refundAddress,
      this.sourceChain,
      this.targetChain,
      this.sourceBridgeContract,
      this.targetBridgeContract,
      this.sourceToken,
      this.targetToken,
    );
    return feeAndParams ? { value: feeAndParams.fee, token: this.sourceNativeToken } : undefined;
  }
}
