import { Address, Hash } from "viem";
import { Chain } from "viem";
import { ConstructorOptions, SolveInfo } from "./lnbridge";
import { HelixProtocolName } from "@helixbridge/helixconf";
import { DEFAULT_CONFIRMATIONS } from "./config";
import { LnBridgeV2 } from "./lnbridge-v2";
import { assert } from "./utils";

export class LnBridgeV2Default extends LnBridgeV2 {
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

  async transfer(amount: bigint, recipient: Address, totalFee: bigint, solveInfo: SolveInfo) {
    assert(this.walletClient, "Wallet client is required");
    assert(solveInfo.lastTransferId, "Transfer ID not found");

    const snapshot = {
      remoteChainId: BigInt(this.targetChain.id),
      provider: solveInfo.relayer as Address,
      sourceToken: this.sourceToken.address,
      targetToken: this.targetToken.address,
      transferId: solveInfo.lastTransferId as Hash,
      totalFee,
      withdrawNonce: solveInfo.withdrawNonce,
    } as const;

    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.sourcePublicClient.simulateContract({
      address: this.sourceBridgeContract,
      abi: (await import(`./abi/lnv2-default`)).default,
      functionName: "transferAndLockMargin",
      args: [snapshot, amount, recipient],
      value: this.sourceToken.isNative ? amount + totalFee : undefined,
      gas: this.getGasLimit(),
      account: signer,
    });
    const hash = await this.walletClient.writeContract(request);
    return this.sourcePublicClient.waitForTransactionReceipt({ hash, confirmations: DEFAULT_CONFIRMATIONS });
  }

  async depositMargin(margin: bigint) {
    assert(this.walletClient, "Wallet client is required");
    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.targetPublicClient.simulateContract({
      address: this.targetBridgeContract,
      abi: (await import(`./abi/lnv2-default`)).default,
      functionName: "depositProviderMargin",
      args: [BigInt(this.sourceChain.id), this.sourceToken.address, this.targetToken.address, margin],
      value: this.targetToken.isNative ? margin : undefined,
      gas: this.getGasLimit(),
      account: signer,
    });
    const hash = await this.walletClient.writeContract(request);
    return this.targetPublicClient.waitForTransactionReceipt({ hash, confirmations: DEFAULT_CONFIRMATIONS });
  }

  async updateFeeAndRate(baseFee: bigint, feeRate: number) {
    assert(this.walletClient, "Wallet client is required");
    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.sourcePublicClient.simulateContract({
      address: this.sourceBridgeContract,
      abi: (await import(`./abi/lnv2-default`)).default,
      functionName: "setProviderFee",
      args: [BigInt(this.targetChain.id), this.sourceToken.address, this.targetToken.address, baseFee, feeRate],
      gas: this.getGasLimit(),
      account: signer,
    });
    const hash = await this.walletClient.writeContract(request);
    return this.sourcePublicClient.waitForTransactionReceipt({ hash, confirmations: DEFAULT_CONFIRMATIONS });
  }

  async withdrawMargin(recipientOrParams: Address | Hash, amount: bigint, fee: bigint) {
    assert(this.walletClient, "Wallet client is required");
    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.sourcePublicClient.simulateContract({
      address: this.sourceBridgeContract,
      abi: (await import(`./abi/lnv2-default`)).default,
      functionName: "requestWithdrawMargin",
      args: [
        BigInt(this.targetChain.id),
        this.sourceToken.address,
        this.targetToken.address,
        amount,
        recipientOrParams,
      ],
      gas: this.getGasLimit(),
      value: fee,
      account: signer,
    });
    const hash = await this.walletClient.writeContract(request);
    return this.sourcePublicClient.waitForTransactionReceipt({ hash, confirmations: DEFAULT_CONFIRMATIONS });
  }
}