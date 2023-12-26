import { BridgeConstructorArgs, GetFeeArgs, HistoryRecord, Token, TransferOptions } from "@/types";
import { BaseBridge } from ".";
import { Address, Hex, TransactionReceipt, encodeFunctionData, isAddressEqual } from "viem";
import { fetchMsglineFeeAndParams } from "@/utils";

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
    const backing = "0xbdC7bbF408931C5d666b4F0520E0D9E9A0B04e99";
    const issuing = "0xf22D0bb66b39745Ae6e3fEa3E5859d7f0b367Fd1";
    this.initContractByBackingIssuing(backing, issuing);
  }

  protected async _transfer(
    sender: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { askEstimateGas?: boolean },
  ): Promise<bigint | TransactionReceipt | undefined> {
    const nonce = BigInt(Date.now());
    const feeAndParams = await this._getTransferFeeAndParams(sender, recipient, amount, nonce);
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
          args: [
            BigInt(this.targetChain.id),
            this.sourceToken.address,
            recipient,
            amount,
            nonce,
            feeAndParams.extParams,
          ],
          value: this.sourceToken.type === "native" ? amount + feeAndParams.fee : feeAndParams.fee,
          gas: this.getTxGasLimit(),
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
          args: [this.sourceToken.address, recipient, amount, nonce, feeAndParams.extParams],
          value: this.sourceToken.type === "native" ? amount + feeAndParams.fee : feeAndParams.fee,
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
    return;
  }

  private async _getTransferFeeAndParams(sender: Address, recipient: Address, amount: bigint, nonce: bigint) {
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
      const message =
        this.crossInfo?.action === "issue"
          ? encodeFunctionData({
              abi: (await import("@/abi/xtoken-issuing")).default,
              functionName: "issuexToken",
              args: [BigInt(this.sourceChain.id), this.sourceToken.address, sender, recipient, amount, nonce],
            })
          : encodeFunctionData({
              abi: (await import("@/abi/xtoken-backing")).default,
              functionName: "unlockFromRemote",
              args: [BigInt(this.sourceChain.id), this.targetToken.address, sender, recipient, amount, nonce],
            });

      const payload = encodeFunctionData({
        abi: (await import("@/abi/msgline-messager")).default,
        functionName: "receiveMessage",
        args: [BigInt(this.sourceChain.id), sourceMessager, targetMessager, message],
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

  async getFee(args?: GetFeeArgs | undefined): Promise<{ value: bigint; token: Token } | undefined> {
    if (this.sourceNativeToken) {
      const nonce = BigInt(Date.now());
      const sender = args?.sender ?? "0x0000000000000000000000000000000000000000";
      const recipient = args?.recipient ?? "0x0000000000000000000000000000000000000000";
      const feeAndParams = await this._getTransferFeeAndParams(sender, recipient, args?.transferAmount ?? 0n, nonce);
      if (feeAndParams) {
        return { value: feeAndParams.fee, token: this.sourceNativeToken };
      }
    }
  }

  async claim(record: HistoryRecord): Promise<TransactionReceipt | undefined> {
    await this.validateNetwork("target");

    if (record.relayer && record.recvTokenAddress && this.contract && this.publicClient && this.walletClient) {
      let guardContract: Address = "0x0000000000000000000000000000000000000000";

      if (this.crossInfo?.action === "issue") {
        guardContract = await this.publicClient.readContract({
          abi: (await import("@/abi/xtoken-issuing")).default,
          functionName: "guard",
          address: this.contract.sourceAddress,
        });
      } else if (this.crossInfo?.action === "redeem") {
        guardContract = await this.publicClient.readContract({
          abi: (await import("@/abi/xtoken-backing")).default,
          functionName: "guard",
          address: this.contract.sourceAddress,
        });
      }

      if (!isAddressEqual(guardContract, "0x0000000000000000000000000000000000000000")) {
        const hash = await this.walletClient.writeContract({
          abi: (await import("@/abi/guard-v3")).default,
          functionName: "claim",
          args: [
            this.contract.sourceAddress,
            BigInt(record.messageNonce || 0),
            BigInt(record.endTime || 0),
            record.recvTokenAddress,
            record.recipient,
            BigInt(record.recvAmount || 0),
            record.guardSignatures?.split("-").slice(1) as Hex[],
          ],
          address: guardContract,
          gas: this.getTxGasLimit(),
        });
        return this.publicClient.waitForTransactionReceipt({ hash });
      }
    }
    return;
  }

  async refund(record: HistoryRecord): Promise<TransactionReceipt | undefined> {
    await this.validateNetwork("target");
    const sourceMessager = this.sourceChain?.messager?.msgline;
    const targetMessager = this.targetChain?.messager?.msgline;
    const nonce = record.messageNonce?.split("-").at(0);

    if (this.contract && sourceMessager && targetMessager && this.publicClient && this.walletClient) {
      let hash: Address | undefined;

      if (this.crossInfo?.action === "issue") {
        const abi = (await import("@/abi/xtoken-issuing")).default;
        const commonArgs = [
          BigInt(this.sourceChain.id),
          record.sendTokenAddress,
          record.sender,
          record.recipient,
          BigInt(record.sendAmount),
          BigInt(nonce ?? 0),
        ] as const;

        const message = encodeFunctionData({
          abi,
          functionName: "handleIssuingForUnlockFailureFromRemote",
          args: commonArgs,
        });
        const payload = encodeFunctionData({
          abi: (await import("@/abi/msgline-messager")).default,
          functionName: "receiveMessage",
          args: [BigInt(this.sourceChain.id), sourceMessager, targetMessager, message],
        });
        const feeAndParams = await fetchMsglineFeeAndParams(
          this.sourceChain.id,
          this.targetChain.id,
          sourceMessager,
          targetMessager,
          record.sender,
          payload,
        );

        if (feeAndParams) {
          hash = await this.walletClient.writeContract({
            abi,
            functionName: "requestRemoteUnlockForIssuingFailure",
            args: [...commonArgs, feeAndParams.extParams],
            address: this.contract.sourceAddress,
            gas: this.getTxGasLimit(),
            value: feeAndParams.fee,
          });
        }
      } else if (this.crossInfo?.action === "redeem" && record.recvTokenAddress) {
        const abi = (await import("@/abi/xtoken-backing")).default;
        const commonArgs = [
          BigInt(this.sourceChain.id),
          record.recvTokenAddress,
          record.sender,
          record.recipient,
          BigInt(record.sendAmount),
          BigInt(nonce ?? 0),
        ] as const;

        const message = encodeFunctionData({
          abi,
          functionName: "handleUnlockForIssuingFailureFromRemote",
          args: commonArgs,
        });
        const payload = encodeFunctionData({
          abi: (await import("@/abi/msgline-messager")).default,
          functionName: "receiveMessage",
          args: [BigInt(this.sourceChain.id), sourceMessager, targetMessager, message],
        });
        const feeAndParams = await fetchMsglineFeeAndParams(
          this.sourceChain.id,
          this.targetChain.id,
          sourceMessager,
          targetMessager,
          record.sender,
          payload,
        );

        if (feeAndParams) {
          hash = await this.walletClient.writeContract({
            abi,
            functionName: "requestRemoteIssuingForUnlockFailure",
            args: [...commonArgs, feeAndParams.extParams],
            address: this.contract.sourceAddress,
            gas: this.getTxGasLimit(),
            value: feeAndParams.fee,
          });
        }
      }

      return hash && this.publicClient.waitForTransactionReceipt({ hash });
    }
  }
}
