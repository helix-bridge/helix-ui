import { CONFIRMATION_BLOCKS } from "../config";
import { BridgeConstructorArgs, GetFeeArgs, MessageChannel, Token, TransferOptions } from "../types";
import { LnBridgeBase } from "./lnbridge-base";
import { Address, Hex, TransactionReceipt, encodeFunctionData, encodePacked, keccak256 } from "viem";

export class LnBridgeV3 extends LnBridgeBase {
  constructor(args: BridgeConstructorArgs) {
    super(args);
    this.name = "Helix LnBridge(v3)";
  }

  protected async _transfer(
    _sender: `0x${string}`,
    recipient: `0x${string}`,
    amount: bigint,
    options?: (TransferOptions & { askEstimateGas?: boolean | undefined }) | undefined,
  ): Promise<bigint | TransactionReceipt | undefined> {
    const account = await this.getSigner();
    const provider = options?.relayer;

    if (
      account &&
      provider &&
      this.contract &&
      this.sourcePublicClient &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken
    ) {
      const askEstimateGas = options?.askEstimateGas ?? false;
      const totalFee = options?.totalFee ?? 0n;

      const defaultParams = {
        address: this.contract.sourceAddress,
        abi: (await import("../abi/lnbridge-v3")).default,
        functionName: "lockAndRemoteRelease",
        args: [
          {
            remoteChainId: BigInt(this.targetChain.id),
            provider,
            sourceToken: this.sourceToken.address,
            targetToken: this.targetToken.address,
            totalFee,
            amount,
            receiver: recipient,
            timestamp: BigInt(Math.floor(Date.now() / 1000)),
          },
        ],
        value: this.sourceToken.type === "native" ? amount + totalFee : undefined,
        gas: this.getTxGasLimit(),
        account,
      } as const;

      if (askEstimateGas) {
        return this.sourcePublicClient.estimateContractGas(defaultParams);
      } else if (this.walletClient) {
        const hash = await this.walletClient.writeContract(defaultParams);
        return this.sourcePublicClient.waitForTransactionReceipt({ hash, confirmations: CONFIRMATION_BLOCKS });
      }
    }
  }

  async getFee(args?: GetFeeArgs | undefined): Promise<{ value: bigint; token: Token } | undefined> {
    const provider = args?.relayer;
    if (
      provider &&
      this.sourcePublicClient &&
      this.contract &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken
    ) {
      return {
        value: await this.sourcePublicClient.readContract({
          address: this.contract.sourceAddress,
          abi: (await import("../abi/lnbridge-v3")).default,
          functionName: "totalFee",
          args: [
            BigInt(this.targetChain.id),
            provider,
            this.sourceToken.address,
            this.targetToken.address,
            args.transferAmount ?? 0n,
          ],
        }),
        token: this.sourceToken,
      };
    }
  }

  async getPenaltyReserves(relayer: Address | null | undefined) {
    if (relayer && this.contract && this.sourceToken && this.sourcePublicClient) {
      const value = await this.sourcePublicClient.readContract({
        address: this.contract.sourceAddress,
        abi: (await import("../abi/lnbridge-v3")).default,
        functionName: "penaltyReserves",
        args: [keccak256(encodePacked(["address", "address"], [this.sourceToken.address, relayer]))],
      });
      return { value, token: this.sourceToken };
    }
  }

  async registerLnProvider(baseFee: bigint, feeRate: number, transferLimit: bigint) {
    await this.validateNetwork("source");

    if (
      this.contract &&
      this.publicClient &&
      this.walletClient &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken
    ) {
      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi: (await import("../abi/lnbridge-v3")).default,
        functionName: "registerLnProvider",
        args: [
          BigInt(this.targetChain.id),
          this.sourceToken.address,
          this.targetToken.address,
          baseFee,
          feeRate,
          transferLimit,
        ],
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash, confirmations: CONFIRMATION_BLOCKS });
    }
  }

  async depositPenaltyReserve(amount: bigint) {
    await this.validateNetwork("source");

    if (this.contract && this.publicClient && this.walletClient && this.sourceToken) {
      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi: (await import("../abi/lnbridge-v3")).default,
        functionName: "depositPenaltyReserve",
        args: [this.sourceToken.address, amount],
        value: this.sourceToken.type === "native" ? amount : undefined,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash, confirmations: CONFIRMATION_BLOCKS });
    }
  }

  async withdrawPenaltyReserve(amount: bigint) {
    await this.validateNetwork("source");

    if (this.contract && this.sourceToken && this.publicClient && this.walletClient) {
      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi: (await import("../abi/lnbridge-v3")).default,
        functionName: "withdrawPenaltyReserve",
        args: [this.sourceToken.address, amount],
      });
      return this.publicClient.waitForTransactionReceipt({ hash, confirmations: CONFIRMATION_BLOCKS });
    }
  }

  async getWithdrawLiquidityFeeAndParams(relayer: Address, transferIds: Hex[], messageChannel: MessageChannel) {
    if (messageChannel === "layerzero") {
      if (this.contract && this.sourceChain && this.targetNativeToken && this.targetPublicClient) {
        const [sendService] = await this.targetPublicClient.readContract({
          address: this.contract.targetAddress,
          abi: (await import("../abi/lnbridge-v3")).default,
          functionName: "messagers",
          args: [BigInt(this.sourceChain.id)],
        });
        const value = await this._getLayerzeroFee(sendService, this.sourceChain, this.targetPublicClient);
        return typeof value === "bigint" ? { value, token: this.targetNativeToken, params: undefined } : undefined;
      }
    } else if (messageChannel === "msgline") {
      if (this.targetNativeToken && this.sourceChain && this.targetChain && this.contract) {
        const message = encodeFunctionData({
          abi: (await import("../abi/lnbridge-v3")).default,
          functionName: "withdrawLiquidity",
          args: [transferIds, BigInt(this.targetChain.id), relayer],
        });
        const feeAndParams = await this._getMsglineFeeAndParams(
          message,
          relayer,
          this.targetChain,
          this.sourceChain,
          this.contract.targetAddress,
          this.contract.sourceAddress,
          this.targetToken,
          this.sourceToken,
        );
        return feeAndParams
          ? { value: feeAndParams.fee, token: this.targetNativeToken, params: feeAndParams.extParams }
          : undefined;
      }
    }
  }

  async requestWithdrawLiquidity(relayer: Address, transferIds: Hex[], messageFee: bigint, extParams: Hex) {
    await this.validateNetwork("target");

    if (this.contract && this.sourceChain && this.publicClient && this.walletClient) {
      const remoteChainId = BigInt(this.sourceChain.id);

      const hash = await this.walletClient.writeContract({
        address: this.contract.targetAddress,
        abi: (await import("../abi/lnbridge-v3")).default,
        functionName: "requestWithdrawLiquidity",
        args: [remoteChainId, transferIds, relayer, extParams],
        value: messageFee,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash, confirmations: CONFIRMATION_BLOCKS });
    }
  }
}
