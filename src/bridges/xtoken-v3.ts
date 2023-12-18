import { BridgeConstructorArgs, GetFeeArgs, Token, TransferOptions } from "@/types";
import { BaseBridge } from ".";
import { Address, Hex, TransactionReceipt } from "viem";

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
    sender: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { askEstimateGas?: boolean },
  ): Promise<bigint | TransactionReceipt | undefined> {
    const feeAndParams = await this._getMsgportFeeAndParams(sender, recipient, amount);
    const account = await this.getSigner();

    if (
      account &&
      feeAndParams &&
      this.contract &&
      this.targetChain &&
      this.sourceToken &&
      this.sourcePublicClient &&
      this.walletClient
    ) {
      const askEstimateGas = options?.askEstimateGas ?? false;

      if (this.crossInfo?.action === "issue") {
        const defaultParams = {
          address: this.contract.sourceAddress,
          abi: (await import("@/abi/xtoken-backing")).default,
          functionName: "lockAndRemoteIssuing",
          args: [BigInt(this.targetChain.id), this.sourceToken.address, recipient, amount, feeAndParams.extParams],
          account,
        } as const;

        if (askEstimateGas) {
          return this.sourcePublicClient.estimateContractGas(defaultParams);
        } else if (this.walletClient) {
          const hash = await this.walletClient.writeContract(defaultParams);
          return this.sourcePublicClient.waitForTransactionReceipt({ hash });
        }
      } else if (this.crossInfo?.action === "redeem") {
        const defaultParams = {
          address: this.contract.sourceAddress,
          abi: (await import("@/abi/xtoken-issuing")).default,
          functionName: "burnAndRemoteUnlock",
          args: [this.sourceToken.address, recipient, amount, feeAndParams.extParams],
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
    return;
  }

  private async _getMsgportFeeAndParams(sender: Address, recipient: Address, amount: bigint) {
    const sourceMessager = this.sourceChain?.messager?.msgline;
    const targetMessager = this.targetChain?.messager?.msgline;

    if (
      sourceMessager &&
      targetMessager &&
      this.contract &&
      this.sourceToken &&
      this.targetToken &&
      this.sourcePublicClient
    ) {
      const message = await (this.crossInfo?.action === "issue"
        ? this.sourcePublicClient.readContract({
            address: this.contract.sourceAddress,
            abi: (await import("@/abi/xtoken-backing")).default,
            functionName: "encodeIssuexToken",
            args: [this.sourceToken.address, recipient, amount],
          })
        : this.sourcePublicClient.readContract({
            address: this.contract.sourceAddress,
            abi: (await import("@/abi/xtoken-issuing")).default,
            functionName: "encodeUnlockFromRemote",
            args: [this.targetToken.address, recipient, amount],
          }));

      const payload = await this.sourcePublicClient.readContract({
        address: sourceMessager,
        abi: (await import("@/abi/msgline-messager")).default,
        functionName: "messagePayload",
        args: [sourceMessager, targetMessager, message],
      });

      const feeData = await fetch(
        `https://msgport-api.darwinia.network/ormp_ext/fee?from_chain_id=${this.sourceChain.id}&to_chain_id=${this.targetChain.id}&payload=${payload}&from_address=${sourceMessager}&to_address=${targetMessager}&refund_address=${sender}`,
      );
      const feeJson = await feeData.json();
      if (feeData.ok && feeJson.code === 0) {
        const fee = BigInt(feeJson.data.fee);
        const extParams = feeJson.data.params as Hex;
        return { fee, extParams };
      }
    }
  }

  async getFee(args?: GetFeeArgs | undefined): Promise<{ value: bigint; token: Token } | undefined> {
    if (this.sourceToken) {
      const sender = args?.sender ?? "0x0000000000000000000000000000000000000000";
      const recipient = args?.recipient ?? "0x0000000000000000000000000000000000000000";
      const feeAndParams = await this._getMsgportFeeAndParams(sender, recipient, args?.transferAmount ?? 0n);
      if (feeAndParams) {
        return { value: feeAndParams.fee, token: this.sourceToken };
      }
    }
  }
}
