import { BridgeConstructorArgs, GetFeeArgs, HistoryRecord, Token, TransferOptions } from "@/types";
import { BaseBridge } from "./base";
import { Address, Hash, Hex, TransactionReceipt, encodeAbiParameters, encodeFunctionData, isAddressEqual } from "viem";
import { fetchMsglineFeeAndParams } from "@/utils";

export class XTokenNextBridge extends BaseBridge {
  constructor(args: BridgeConstructorArgs) {
    super(args);
    this.logo = {
      horizontal: "helix-horizontal.svg",
      symbol: "helix-symbol.svg",
    };
    this.name = "xToken";
    this._initContract();
    this._initConvertor();
  }

  private _initContract() {
    let backing: Address = "0x94eAb0CB67AB7edaf9A280aCa097F70e4BD780ac";
    let issuing: Address = "0x371019523b25Ff4F26d977724f976566b08bf741";
    if (
      (this.sourceChain?.network === "pangolin-dvm" && this.targetChain?.network === "sepolia") ||
      (this.sourceChain?.network === "sepolia" && this.targetChain?.network === "pangolin-dvm")
    ) {
      backing = "0x24f8a04F0cA0730F4b8eC3241F15aCc6b3f8Da0a";
      issuing = "0x1aeC008Af5c604be3525d0bB70fFcc4D7281f30C";
    } else if (
      (this.sourceChain?.network === "darwinia-dvm" && this.targetChain?.network === "crab-dvm") ||
      (this.sourceChain?.network === "crab-dvm" && this.targetChain?.network === "darwinia-dvm")
    ) {
      backing = "0xa64D1c284280b22f921E7B2A55040C7bbfD4d9d0";
      issuing = "0xf6372ab2d35B32156A19F2d2F23FA6dDeFBE58bd";
    } else if (
      (this.sourceChain?.network === "darwinia-dvm" && this.targetChain?.network === "ethereum") ||
      (this.sourceChain?.network === "ethereum" && this.targetChain?.network === "darwinia-dvm")
    ) {
      backing = "0x2B496f19A420C02490dB859fefeCCD71eDc2c046";
      issuing = "0xDc0C760c0fB4672D06088515F6446a71Df0c64C1";
    }
    this.initContractByBackingIssuing(backing, issuing);
  }

  private _initConvertor() {
    if (
      this.sourceChain?.network === "pangolin-dvm" &&
      this.targetChain?.network === "sepolia" &&
      this.sourceToken?.type === "native"
    ) {
      // Issue native token
      this.convertor = {
        source: "0xB3A8DB63d6FBE0f50A3D4977c3e892543D772C4A",
        target: "0x4CdFe9915d2c72506f4fC2363A8EaE032E82d1aA",
      };
    } else if (
      this.sourceChain?.network === "sepolia" &&
      this.targetChain?.network === "pangolin-dvm" &&
      this.targetToken?.type === "native"
    ) {
      // Redeem native token
      this.convertor = {
        source: "0x4CdFe9915d2c72506f4fC2363A8EaE032E82d1aA",
        target: "0xB3A8DB63d6FBE0f50A3D4977c3e892543D772C4A",
      };
    } else if (
      this.sourceChain?.network === "darwinia-dvm" &&
      this.targetChain?.network === "ethereum" &&
      this.sourceToken?.type === "native"
    ) {
      this.convertor = {
        source: "0x092e19c46c9daab7824393f1cd9c22f5bea13560",
        target: "0xc29dCb1F12a1618262eF9FBA673b77140adc02D6",
      };
    } else if (
      this.sourceChain?.network === "ethereum" &&
      this.targetChain?.network === "darwinia-dvm" &&
      this.targetToken?.type === "native"
    ) {
      this.convertor = {
        source: "0xc29dCb1F12a1618262eF9FBA673b77140adc02D6",
        target: "0x092e19c46c9daab7824393f1cd9c22f5bea13560",
      };
    } else if (this.sourceChain?.network === "darwinia-dvm" && this.targetChain?.network === "crab-dvm") {
      const source = this.sourceToken?.type === "native" ? "0xA8d0E9a45249Ec839C397fa0F371f5F64eCAB7F7" : undefined;
      const target = this.targetToken?.type === "native" ? "0x004D0dE211BC148c3Ce696C51Cbc85BD421727E9" : undefined;
      this.convertor = { source, target };
    } else if (this.sourceChain?.network === "crab-dvm" && this.targetChain?.network === "darwinia-dvm") {
      const source = this.sourceToken?.type === "native" ? "0x004D0dE211BC148c3Ce696C51Cbc85BD421727E9" : undefined;
      const target = this.targetToken?.type === "native" ? "0xA8d0E9a45249Ec839C397fa0F371f5F64eCAB7F7" : undefined;
      this.convertor = { source, target };
    }
  }

  protected async _transfer(
    sender: Address,
    recipient: Address,
    amount: bigint,
    options?: (TransferOptions & { askEstimateGas?: boolean | undefined }) | undefined,
  ): Promise<bigint | TransactionReceipt | undefined> {
    const account = await this.getSigner();
    const askEstimateGas = options?.askEstimateGas ?? false;

    const nonce = BigInt(Date.now());
    const { recipient: pRecipient, extData } = await this._getExtDataAndRecipient(recipient);
    const feeAndParams = await this._getTransferFeeAndParams(sender, recipient, amount, nonce);

    if (account && feeAndParams && this.contract && this.sourceToken && this.targetChain && this.sourcePublicClient) {
      const value = this.sourceToken.type === "native" ? amount + feeAndParams.fee : feeAndParams.fee;
      const gas = this.getTxGasLimit();

      if (this.crossInfo?.action === "issue") {
        if (this.convertor?.source) {
          const defaultParams = {
            abi: (await import("@/abi/wtoken-convertor")).default,
            functionName: "lockAndXIssue",
            args: [BigInt(this.targetChain.id), pRecipient, sender, amount, nonce, extData, feeAndParams.extParams],
            address: this.convertor.source,
            account,
            value,
            gas,
          } as const;

          if (askEstimateGas) {
            return this.sourcePublicClient.estimateContractGas(defaultParams);
          } else if (this.walletClient) {
            const hash = await this.walletClient.writeContract(defaultParams);
            return this.sourcePublicClient.waitForTransactionReceipt({ hash });
          }
        } else {
          const defaultParams = {
            abi: (await import("@/abi/xtoken-backing-next")).default,
            functionName: "lockAndXIssue",
            args: [
              BigInt(this.targetChain.id),
              this.sourceToken.address,
              pRecipient,
              sender,
              amount,
              nonce,
              extData,
              feeAndParams.extParams,
            ],
            address: this.contract.sourceAddress,
            account,
            value,
            gas,
          } as const;

          if (askEstimateGas) {
            return this.sourcePublicClient.estimateContractGas(defaultParams);
          } else if (this.walletClient) {
            const hash = await this.walletClient.writeContract(defaultParams);
            return this.sourcePublicClient.waitForTransactionReceipt({ hash });
          }
        }
      } else if (this.crossInfo?.action === "redeem") {
        if (this.convertor?.source) {
          const defaultParams = {
            abi: (await import("@/abi/xtoken-convertor")).default,
            functionName: "burnAndXUnlock",
            args: [pRecipient, sender, amount, nonce, extData, feeAndParams.extParams],
            address: this.convertor.source,
            account,
            value,
            gas,
          } as const;

          if (askEstimateGas) {
            return this.sourcePublicClient.estimateContractGas(defaultParams);
          } else if (this.walletClient) {
            const hash = await this.walletClient.writeContract(defaultParams);
            return this.sourcePublicClient.waitForTransactionReceipt({ hash });
          }
        } else {
          const defaultParams = {
            abi: (await import("@/abi/xtoken-issuing-next")).default,
            functionName: "burnAndXUnlock",
            args: [this.sourceToken.inner, pRecipient, sender, amount, nonce, extData, feeAndParams.extParams],
            address: this.contract.sourceAddress,
            account,
            value,
            gas,
          } as const;

          if (askEstimateGas) {
            return this.sourcePublicClient.estimateContractGas(defaultParams);
          } else if (this.walletClient) {
            const hash = await this.walletClient.writeContract(defaultParams);
            return this.sourcePublicClient.waitForTransactionReceipt({ hash });
          }
        }
      }
    }
  }

  private async _getExtDataAndRecipient(defaultRecipient: Address) {
    const guard = await this._getTargetGuard();
    let recipient = defaultRecipient;
    let extData: Hash = "0x";

    if (guard && this.convertor?.target) {
      // Guard, convertor
      recipient = guard;
      extData = encodeAbiParameters(
        [
          { name: "x", type: "address" },
          { name: "y", type: "bytes" },
        ],
        [this.convertor.target, defaultRecipient],
      );
    } else if (this.convertor?.target) {
      // No guard, convertor
      recipient = this.convertor.target;
      extData = defaultRecipient;
    } else if (guard) {
      // Guard, no convertor
      recipient = guard;
      extData = encodeAbiParameters(
        [
          { name: "x", type: "address" },
          { name: "y", type: "bytes" },
        ],
        [defaultRecipient, "0x"],
      );
    } else {
      // No guard, no convertor
      recipient = defaultRecipient;
      extData = "0x";
    }
    return { recipient, extData };
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
      let message: Hash | undefined;
      const originalSender = this.convertor?.source ?? sender;
      const { recipient: pRecipient, extData } = await this._getExtDataAndRecipient(recipient);

      if (this.crossInfo?.action === "issue") {
        message = encodeFunctionData({
          abi: (await import("@/abi/xtoken-issuing-next")).default,
          functionName: "issue",
          args: [
            BigInt(this.sourceChain.id),
            this.sourceToken.inner,
            originalSender,
            pRecipient,
            sender,
            amount,
            nonce,
            extData,
          ],
        });
      } else if (this.crossInfo?.action === "redeem") {
        message = encodeFunctionData({
          abi: (await import("@/abi/xtoken-backing-next")).default,
          functionName: "unlock",
          args: [
            BigInt(this.sourceChain.id),
            this.targetToken.inner,
            originalSender,
            pRecipient,
            sender,
            amount,
            nonce,
            extData,
          ],
        });
      }

      if (message) {
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

  async getDailyLimit(): Promise<{ limit: bigint; spent: bigint; token: Token } | undefined> {
    if (this.contract && this.sourceToken && this.targetToken && this.targetPublicClient) {
      const limit = await this.targetPublicClient.readContract({
        address: this.contract.targetAddress,
        abi: (await import("@/abi/xtoken-issuing-next")).default,
        functionName: "calcMaxWithdraw",
        args: [this.targetToken.inner],
      });
      return { limit, spent: 0n, token: this.sourceToken };
    }
  }

  async claim(record: HistoryRecord): Promise<TransactionReceipt | undefined> {
    await this.validateNetwork("target");
    const guard = await this._getTargetGuard();

    if (record.recvTokenAddress && guard && this.contract && this.walletClient && this.publicClient) {
      const hash = await this.walletClient.writeContract({
        abi: (await import("@/abi/guard-next")).default,
        functionName: "claim",
        args: [
          this.contract.targetAddress,
          BigInt(record.id.split("-").slice(-1)[0]),
          BigInt(record.endTime || 0),
          record.recvTokenAddress, // TODO: inner address
          BigInt(record.recvAmount || 0),
          record.extData,
          record.guardSignatures?.split("-").slice(1) as Hex[],
        ],
        address: guard,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async refund(record: HistoryRecord): Promise<TransactionReceipt | undefined> {
    await this.validateNetwork("target");
    const sourceMessager = this.sourceChain?.messager?.msgline;
    const targetMessager = this.targetChain?.messager?.msgline;
    const nonce = record.messageNonce?.split("-").at(0);

    if (
      sourceMessager &&
      targetMessager &&
      this.contract &&
      this.publicClient &&
      this.walletClient &&
      this.sourceToken &&
      this.targetToken
    ) {
      const originalSender = this.convertor?.source ?? record.sender;
      const { recipient: pRecipient } = await this._getExtDataAndRecipient(record.recipient);

      if (this.crossInfo?.action === "issue") {
        const message = encodeFunctionData({
          abi: (await import("@/abi/xtoken-backing-next")).default,
          functionName: "rollbackLockAndXIssue",
          args: [
            BigInt(this.targetChain.id),
            this.sourceToken.inner,
            originalSender,
            pRecipient,
            record.sender,
            BigInt(record.sendAmount),
            BigInt(nonce ?? 0),
          ],
        });

        const payload = encodeFunctionData({
          abi: (await import("@/abi/msgline-messager")).default,
          functionName: "receiveMessage",
          args: [BigInt(this.targetChain.id), this.contract.targetAddress, this.contract.sourceAddress, message],
        });

        const feeAndParams = await fetchMsglineFeeAndParams(
          this.targetChain.id,
          this.sourceChain.id,
          targetMessager,
          sourceMessager,
          record.sender,
          payload,
        );

        if (feeAndParams) {
          const hash = await this.walletClient.writeContract({
            address: this.contract.targetAddress,
            abi: (await import("@/abi/xtoken-issuing-next")).default,
            functionName: "xRollbackLockAndXIssue",
            args: [
              BigInt(this.sourceChain.id),
              this.sourceToken.inner,
              originalSender,
              pRecipient,
              record.sender,
              BigInt(record.sendAmount),
              BigInt(nonce ?? 0),
              feeAndParams.extParams,
            ],
            gas: this.getTxGasLimit(),
            value: feeAndParams.fee,
          });
          return this.publicClient.waitForTransactionReceipt({ hash });
        }
      } else if (this.crossInfo?.action === "redeem") {
        const message = encodeFunctionData({
          abi: (await import("@/abi/xtoken-issuing-next")).default,
          functionName: "rollbackBurnAndXUnlock",
          args: [
            BigInt(this.targetChain.id),
            this.targetToken.inner,
            originalSender,
            pRecipient,
            record.sender,
            BigInt(record.sendAmount),
            BigInt(nonce ?? 0),
          ],
        });

        const payload = encodeFunctionData({
          abi: (await import("@/abi/msgline-messager")).default,
          functionName: "receiveMessage",
          args: [BigInt(this.targetChain.id), this.contract.targetAddress, this.contract.sourceAddress, message],
        });

        const feeAndParams = await fetchMsglineFeeAndParams(
          this.targetChain.id,
          this.sourceChain.id,
          targetMessager,
          sourceMessager,
          record.sender,
          payload,
        );

        if (feeAndParams) {
          const hash = await this.walletClient.writeContract({
            address: this.contract.targetAddress,
            abi: (await import("@/abi/xtoken-backing-next")).default,
            functionName: "xRollbackBurnAndXUnlock",
            args: [
              BigInt(this.sourceChain.id),
              this.targetToken.inner,
              originalSender,
              pRecipient,
              record.sender,
              BigInt(record.sendAmount),
              BigInt(nonce ?? 0),
              feeAndParams.extParams,
            ],
            gas: this.getTxGasLimit(),
            value: feeAndParams.fee,
          });
          return this.publicClient.waitForTransactionReceipt({ hash });
        }
      }
    }
  }

  // private async _getSourceGuard() {
  //   if (this.contract && this.sourcePublicClient) {
  //     const guard = await this.sourcePublicClient.readContract({
  //       abi: (await import("@/abi/xtoken-issuing-next")).default,
  //       functionName: "guard",
  //       address: this.contract.sourceAddress,
  //     });
  //     return isAddressEqual(guard, "0x0000000000000000000000000000000000000000") ? undefined : guard;
  //   }
  // }

  private async _getTargetGuard() {
    if (this.contract && this.targetPublicClient) {
      const guard = await this.targetPublicClient.readContract({
        abi: (await import("@/abi/xtoken-issuing-next")).default,
        functionName: "guard",
        address: this.contract.targetAddress,
      });
      return isAddressEqual(guard, "0x0000000000000000000000000000000000000000") ? undefined : guard;
    }
  }
}
