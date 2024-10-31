import { Address, Hex, TransactionReceipt } from "viem";
import { LnBridgeBase } from "./lnbridge-base";
import { BridgeConstructorArgs, TransferOptions } from "../types/bridge";
import { CONFIRMATION_BLOCKS } from "../config";

export class LnBridgeV2Default extends LnBridgeBase {
  constructor(args: BridgeConstructorArgs) {
    super(args);
  }

  protected async _transfer(
    _sender: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { askEstimateGas?: boolean },
  ): Promise<bigint | TransactionReceipt | undefined> {
    const account = await this.getSigner();
    const provider = options?.relayer;
    const transferId = options?.transferId;

    if (
      account &&
      provider &&
      transferId &&
      this.contract &&
      this.sourcePublicClient &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken
    ) {
      const askEstimateGas = options?.askEstimateGas ?? false;
      const totalFee = options?.totalFee ?? 0n;
      const snapshot = {
        remoteChainId: BigInt(this.targetChain.id),
        provider,
        sourceToken: this.sourceToken.address,
        targetToken: this.targetToken.address,
        transferId,
        totalFee: totalFee,
        withdrawNonce: options?.withdrawNonce || 0n,
      };

      const defaultParams = {
        address: this.contract.sourceAddress,
        abi: (await import(`../abi/lnv2-default`)).default,
        functionName: "transferAndLockMargin",
        args: [snapshot, amount, recipient],
        value: this.sourceToken.type === "native" ? amount + totalFee : undefined,
        gas: this.getTxGasLimit(),
        account,
      } as const;

      if (askEstimateGas) {
        return this.sourcePublicClient.estimateContractGas(defaultParams);
      } else if (this.walletClient) {
        const { request } = await this.sourcePublicClient.simulateContract(defaultParams);
        const hash = await this.walletClient.writeContract(request);
        return this.sourcePublicClient.waitForTransactionReceipt({ hash, confirmations: CONFIRMATION_BLOCKS });
      }
    }
  }

  async depositMargin(margin: bigint) {
    await this.validateNetwork("target");
    const account = await this.getSigner();

    if (
      account &&
      this.contract &&
      this.sourceChain &&
      this.sourceToken &&
      this.targetToken &&
      this.publicClient &&
      this.walletClient
    ) {
      const { request } = await this.publicClient.simulateContract({
        address: this.contract.targetAddress,
        abi: (await import(`../abi/lnv2-default`)).default,
        functionName: "depositProviderMargin",
        args: [BigInt(this.sourceChain.id), this.sourceToken.address, this.targetToken.address, margin],
        value: this.targetToken.type === "native" ? margin : undefined,
        gas: this.getTxGasLimit(),
        account,
      });
      const hash = await this.walletClient.writeContract(request);
      return this.publicClient.waitForTransactionReceipt({ hash, confirmations: CONFIRMATION_BLOCKS });
    }
  }

  async setFeeAndRate(baseFee: bigint, feeRate: number) {
    await this.validateNetwork("source");
    const account = await this.getSigner();

    if (
      account &&
      this.contract &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken &&
      this.publicClient &&
      this.walletClient
    ) {
      const { request } = await this.publicClient.simulateContract({
        address: this.contract.sourceAddress,
        abi: (await import(`../abi/lnv2-default`)).default,
        functionName: "setProviderFee",
        args: [BigInt(this.targetChain.id), this.sourceToken.address, this.targetToken.address, baseFee, feeRate],
        gas: this.getTxGasLimit(),
        account,
      });
      const hash = await this.walletClient.writeContract(request);
      return this.publicClient.waitForTransactionReceipt({ hash, confirmations: CONFIRMATION_BLOCKS });
    }
  }

  async withdrawMargin(recipientOrParams: Address | Hex, amount: bigint, fee: bigint) {
    await this.validateNetwork("source");
    const account = await this.getSigner();

    if (
      account &&
      this.contract &&
      this.sourceToken &&
      this.targetToken &&
      this.targetChain &&
      this.publicClient &&
      this.walletClient
    ) {
      const remoteChainId = BigInt(this.targetChain.id);

      const { request } = await this.publicClient.simulateContract({
        address: this.contract.sourceAddress,
        abi: (await import(`../abi/lnv2-default`)).default,
        functionName: "requestWithdrawMargin",
        args: [remoteChainId, this.sourceToken.address, this.targetToken.address, amount, recipientOrParams],
        gas: this.getTxGasLimit(),
        value: fee,
        account,
      });
      const hash = await this.walletClient.writeContract(request);
      return this.publicClient.waitForTransactionReceipt({ hash, confirmations: CONFIRMATION_BLOCKS });
    }
  }
}
