import { BridgeConstructorArgs, GetFeeArgs, Token, TransferOptions } from "@/types";
import { LnBridgeBase } from "./lnbridge-base";
import { TransactionReceipt } from "viem";

export class LnBridgeV3 extends LnBridgeBase {
  constructor(args: BridgeConstructorArgs) {
    super(args);
    this.name = "Helix LnBridge(v3)";
    this._initContract();
  }

  private _initContract() {
    if (this.sourceChain?.network === "zksync-sepolia") {
      this.contract = {
        sourceAddress: "0xDc55fF59F82AA50D8A4A61dB8CcaDffD26Fb7dD2",
        targetAddress: "0x38627Cb033De66a1E07e73f5D0a7a7adFB6741fa",
      };
    } else if (this.targetChain?.network === "zksync-sepolia") {
      this.contract = {
        sourceAddress: "0x38627Cb033De66a1E07e73f5D0a7a7adFB6741fa",
        targetAddress: "0xDc55fF59F82AA50D8A4A61dB8CcaDffD26Fb7dD2",
      };
    } else {
      this.contract = {
        sourceAddress: "0x38627Cb033De66a1E07e73f5D0a7a7adFB6741fa",
        targetAddress: "0x38627Cb033De66a1E07e73f5D0a7a7adFB6741fa",
      };
    }
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
        abi: (await import("@/abi/lnbridge-v3")).default,
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
        return this.sourcePublicClient.waitForTransactionReceipt({ hash });
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
          abi: (await import("@/abi/lnbridge-v3")).default,
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
        abi: (await import("@/abi/lnbridge-v3")).default,
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
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async depositPenaltyReserve(amount: bigint) {
    await this.validateNetwork("source");

    if (this.contract && this.publicClient && this.walletClient && this.sourceToken) {
      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi: (await import("@/abi/lnbridge-v3")).default,
        functionName: "depositPenaltyReserve",
        args: [this.sourceToken.address, amount],
        value: this.sourceToken.type === "native" ? amount : undefined,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }
}
