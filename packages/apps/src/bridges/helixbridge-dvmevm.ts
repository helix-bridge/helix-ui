import { BridgeCategory, BridgeLogo, TransferOptions } from "@/types/bridge";
import { BaseBridge } from "./base";
import { ChainConfig } from "@/types/chain";
import { Token } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { Address, TransactionReceipt } from "viem";
import { HistoryRecord } from "@/types/graphql";

/**
 * DVM <=> EVM
 */

export class HelixBridgeDVMEVM extends BaseBridge {
  private guard: Address | undefined;

  constructor(args: {
    walletClient?: WalletClient | null;
    publicClient?: PublicClient;
    category: BridgeCategory;
    logo?: BridgeLogo;

    sourceChain?: ChainConfig;
    targetChain?: ChainConfig;
    sourceToken?: Token;
    targetToken?: Token;
  }) {
    super(args);
    this.initContract();

    this.logo = args.logo ?? {
      horizontal: "helix-horizontal.svg",
      symbol: "helix-symbol.svg",
    };
    this.name = "Helix(Legacy)";
  }

  private initContract() {
    const backing = "0xD1B10B114f1975d8BCc6cb6FC43519160e2AA978";
    const issuing = "0xFBAD806Bdf9cEC2943be281FB355Da05068DE925";
    this.initContractFromBackingIssuing(backing, issuing);
    this.guard = "0x61B6B8c7C00aA7F060a2BEDeE6b11927CC9c3eF1";
  }

  private async lock(_: string, recipient: Address, amount: bigint, options?: { totalFee: bigint }) {
    if (options && this.contract && this.sourceToken && this.publicClient && this.walletClient) {
      const abi = (await import("@/abi/backing-dvmevm")).default;
      const address = this.contract.sourceAddress;
      const gas = this.getTxGasLimit();

      const hash = await (this.sourceToken.type === "native"
        ? this.walletClient.writeContract({
            abi,
            address,
            gas,
            functionName: "lockAndRemoteIssuingNative",
            args: [recipient, amount],
            value: amount + options.totalFee,
          })
        : this.walletClient.writeContract({
            abi,
            address,
            gas,
            functionName: "lockAndRemoteIssuing",
            args: [this.sourceToken.address, recipient, amount],
            value: options.totalFee,
          }));
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  private async burn(_: string, recipient: Address, amount: bigint, options?: { totalFee: bigint }) {
    if (options && this.contract && this.sourceToken && this.targetToken && this.publicClient && this.walletClient) {
      const abi = (await import("@/abi/mappingtoken-dvmevm")).default;
      const value = options.totalFee;
      const address = this.contract.sourceAddress;
      const gas = this.getTxGasLimit();

      const hash = await (this.targetToken.type === "native"
        ? this.walletClient.writeContract({
            address,
            abi,
            value,
            gas,
            functionName: "burnAndRemoteUnlockNative",
            args: [recipient, amount],
          })
        : this.walletClient.writeContract({
            address,
            abi,
            value,
            gas,
            functionName: "burnAndRemoteUnlock",
            args: [this.sourceToken.address, recipient, amount],
          }));
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async transfer(
    sender: Address,
    recipient: Address,
    amount: bigint,
    options?: Pick<TransferOptions, "totalFee">,
  ): Promise<TransactionReceipt | undefined> {
    await this.validateNetwork("source");

    if (this.crossInfo?.action === "redeem") {
      return this.burn(sender, recipient, amount, options);
    } else {
      return this.lock(sender, recipient, amount, options);
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
          BigInt(record.endTime),
          record.recvTokenAddress || "0x",
          record.recipient,
          BigInt(record.recvAmount),
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
