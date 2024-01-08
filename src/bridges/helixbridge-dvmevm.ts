import { BridgeConstructorArgs, TransferOptions } from "@/types/bridge";
import { BaseBridge } from "./base";
import { Address, TransactionReceipt } from "viem";
import { HistoryRecord } from "@/types/graphql";

/**
 * DVM <=> EVM
 */

export class HelixBridgeDVMEVM extends BaseBridge {
  private guard: Address | undefined;

  constructor(args: BridgeConstructorArgs) {
    const sourceToken = args.sourceToken ? { ...args.sourceToken } : undefined; // DON'T USE `const sourceToken = args.sourceToken`
    const targetToken = args.targetToken ? { ...args.targetToken } : undefined;
    if (args.sourceChain?.network === "darwinia-dvm" && sourceToken?.symbol === "RING") {
      sourceToken.address = "0xE7578598Aac020abFB918f33A20faD5B71d670b4";
    } else if (args.targetChain?.network === "darwinia-dvm" && targetToken?.symbol === "RING") {
      targetToken.address = "0xE7578598Aac020abFB918f33A20faD5B71d670b4";
    }
    super({ ...args, sourceToken, targetToken });

    this._initContract();

    this.logo = {
      horizontal: "helix-horizontal.svg",
      symbol: "helix-symbol.svg",
    };
    this.name = "Helix(Legacy)";
  }

  private _initContract() {
    const backing = "0xD1B10B114f1975d8BCc6cb6FC43519160e2AA978";
    const issuing = "0xFBAD806Bdf9cEC2943be281FB355Da05068DE925";
    this.initContractByBackingIssuing(backing, issuing);
    this.guard = "0x61B6B8c7C00aA7F060a2BEDeE6b11927CC9c3eF1";
  }

  private async lock(
    account: Address,
    _: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { askEstimateGas?: boolean },
  ) {
    if (this.contract && this.sourceToken && this.sourcePublicClient) {
      const totalFee = options?.totalFee ?? 0n;
      const askEstimateGas = options?.askEstimateGas ?? false;

      const abi = (await import("@/abi/backing-dvmevm")).default;
      const address = this.contract.sourceAddress;
      const gas = this.getTxGasLimit();

      const defaultParams = {
        abi,
        address,
        gas,
        functionName: "lockAndRemoteIssuing",
        args: [this.sourceToken.address, recipient, amount],
        value: totalFee,
        account,
      } as const;
      const nativeParams = {
        abi,
        address,
        gas,
        functionName: "lockAndRemoteIssuingNative",
        args: [recipient, amount],
        value: amount + totalFee,
        account,
      } as const;

      if (askEstimateGas) {
        return this.sourceToken.type === "native"
          ? this.sourcePublicClient.estimateContractGas(nativeParams)
          : this.sourcePublicClient.estimateContractGas(defaultParams);
      } else if (this.walletClient) {
        const hash = await (this.sourceToken.type === "native"
          ? this.walletClient.writeContract(nativeParams)
          : this.walletClient.writeContract(defaultParams));
        return this.sourcePublicClient.waitForTransactionReceipt({ hash });
      }
    }
  }

  private async burn(
    account: Address,
    _: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { askEstimateGas?: boolean },
  ) {
    if (this.contract && this.sourceToken && this.targetToken && this.sourcePublicClient) {
      const abi = (await import("@/abi/mappingtoken-dvmevm")).default;
      const address = this.contract.sourceAddress;
      const gas = this.getTxGasLimit();
      const value = options?.totalFee ?? 0n;
      const askEstimateGas = options?.askEstimateGas ?? false;

      const defaultParams = {
        address,
        abi,
        value,
        gas,
        functionName: "burnAndRemoteUnlock",
        args: [this.sourceToken.address, recipient, amount],
        account,
      } as const;
      const nativeParams = {
        address,
        abi,
        value,
        gas,
        functionName: "burnAndRemoteUnlockNative",
        args: [recipient, amount],
        account,
      } as const;

      if (askEstimateGas) {
        return this.targetToken.type === "native"
          ? this.sourcePublicClient.estimateContractGas(nativeParams)
          : this.sourcePublicClient.estimateContractGas(defaultParams);
      } else if (this.walletClient) {
        const hash = await (this.targetToken.type === "native"
          ? this.walletClient.writeContract(nativeParams)
          : this.walletClient.writeContract(defaultParams));
        return this.sourcePublicClient.waitForTransactionReceipt({ hash });
      }
    }
  }

  protected async _transfer(
    sender: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { askEstimateGas?: boolean },
  ): Promise<bigint | TransactionReceipt | undefined> {
    const account = await this.getSigner();

    if (this.crossInfo?.action === "redeem") {
      return account && this.burn(account, sender, recipient, amount, options);
    } else if (this.crossInfo?.action === "issue") {
      return account && this.lock(account, sender, recipient, amount, options);
    }
  }

  async claim(record: HistoryRecord) {
    await this.validateNetwork("target");

    if (this.guard && this.publicClient && this.walletClient) {
      const hash = await this.walletClient.writeContract({
        address: this.guard,
        abi: (await import("@/abi/guard")).default,
        functionName: "claim",
        args: [
          BigInt(record.messageNonce || 0),
          BigInt(record.endTime || 0),
          record.recvTokenAddress || "0x",
          record.recipient,
          BigInt(record.recvAmount || 0),
          record.guardSignatures?.split("-").slice(1) as Address[],
        ],
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async refund(record: HistoryRecord) {
    await this.validateNetwork("target");

    if (this.contract && this.publicClient && this.walletClient) {
      const sendAmount = BigInt(record.sendAmount);
      const sendTokenAddress = record.sendTokenAddress || "0x";
      const transferId = BigInt(record.id.split("-").slice(-1).join(""));

      const value = (await this.getFee())?.value;
      const address = this.contract.targetAddress;
      const gas = this.getTxGasLimit();
      let hash: Address | undefined;

      if (this.crossInfo?.action === "issue") {
        const abi = (await import("@/abi/mappingtoken-dvmevm")).default;
        if (this.sourceToken?.type === "native") {
          hash = await this.walletClient.writeContract({
            address,
            value,
            gas,
            abi,
            functionName: "remoteUnlockFailureNative",
            args: [transferId, record.sender, sendAmount],
          });
        } else {
          hash = await this.walletClient.writeContract({
            address,
            value,
            gas,
            abi,
            functionName: "remoteUnlockFailure",
            args: [transferId, sendTokenAddress, record.sender, sendAmount],
          });
        }
      } else {
        const abi = (await import("@/abi/backing-dvmevm")).default;
        hash = await this.walletClient.writeContract({
          address,
          value,
          gas,
          abi,
          functionName: "remoteIssuingFailure",
          args: [transferId, sendTokenAddress, record.sender, sendAmount],
        });
      }
      return hash && this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async getFee() {
    if (this.contract && this.sourceNativeToken && this.sourcePublicClient) {
      const address = this.contract.sourceAddress;
      const functionName = "currentFee" as const;

      const value = await (this.crossInfo?.action === "issue"
        ? this.sourcePublicClient.readContract({
            address,
            functionName,
            abi: (await import("@/abi/backing-dvmevm")).default,
          })
        : this.sourcePublicClient.readContract({
            address,
            functionName,
            abi: (await import("@/abi/mappingtoken-dvmevm")).default,
          }));
      return { value, token: this.sourceNativeToken };
    }
  }

  async getDailyLimit() {
    if (this.contract && this.sourceToken && this.targetToken && this.targetPublicClient) {
      const address = this.contract.targetAddress;
      const functionName = "calcMaxWithdraw" as const;
      const args = [this.targetToken.address] as const;

      const limit = await (this.crossInfo?.action === "issue"
        ? this.targetPublicClient.readContract({
            address,
            functionName,
            args,
            abi: (await import("@/abi/mappingtoken-dvmevm")).default,
          })
        : this.targetPublicClient.readContract({
            address,
            functionName,
            args,
            abi: (await import("@/abi/backing-dvmevm")).default,
          }));
      return { limit, spent: 0n, token: this.sourceToken };
    }
  }
}
