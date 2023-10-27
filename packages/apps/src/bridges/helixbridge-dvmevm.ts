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

  private async lock(_: string, recipient: string, amount: bigint, options?: { totalFee: bigint }) {
    if (options && this.contract && this.sourceToken && this.publicClient && this.walletClient) {
      const { args, value, functionName } =
        this.sourceToken.type === "native"
          ? {
              functionName: "lockAndRemoteIssuingNative",
              args: [recipient, amount],
              value: amount + options.totalFee,
            }
          : {
              functionName: "lockAndRemoteIssuing",
              args: [this.sourceToken.address, recipient, amount],
              value: options.totalFee,
            };
      const abi = (await import("@/abi/backing-dvmevm.json")).default;

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi,
        functionName,
        args,
        value,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  private async burn(_: string, recipient: string, amount: bigint, options?: { totalFee: bigint }) {
    if (options && this.contract && this.sourceToken && this.targetToken && this.publicClient && this.walletClient) {
      const { args, functionName } =
        this.targetToken.type === "native"
          ? {
              functionName: "burnAndRemoteUnlockNative",
              args: [recipient, amount],
            }
          : {
              functionName: "burnAndRemoteUnlock",
              args: [this.sourceToken.address, recipient, amount],
            };
      const abi = (await import("@/abi/mappingtoken-dvmevm.json")).default;
      const value = options.totalFee;

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi,
        functionName,
        args,
        value,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async transfer(
    sender: string,
    recipient: string,
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
      const abi = (await import("@/abi/guard.json")).default;

      const hash = await this.walletClient.writeContract({
        address: this.guard,
        abi,
        functionName: "claim",
        args: [
          record.messageNonce,
          record.endTime,
          record.recvTokenAddress,
          record.recipient,
          record.recvAmount,
          record.guardSignatures?.split("-").slice(1),
        ],
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async refund(record: HistoryRecord) {
    await this.validateNetwork("target");

    if (this.contract && this.publicClient && this.walletClient) {
      const { abi, functionName } =
        this.crossInfo?.action === "issue"
          ? {
              abi: (await import("@/abi/mappingtoken-dvmevm.json")).default,
              functionName: this.sourceToken?.type === "native" ? "remoteUnlockFailureNative" : "remoteUnlockFailure",
            }
          : {
              abi: (await import("@/abi/backing-dvmevm.json")).default,
              functionName: "remoteIssuingFailure",
            };
      const args =
        this.sourceToken?.type === "native"
          ? [record.id.split("-").slice(-1), record.sender, record.sendAmount]
          : [record.id.split("-").slice(-1), record.sendTokenAddress, record.sender, record.sendAmount];
      const value = (await this.getFee())?.value;

      const hash = await this.walletClient.writeContract({
        address: this.contract.targetAddress,
        abi,
        functionName,
        args,
        value,
        gas: this.getTxGasLimit(),
      });
      return await this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async getFee() {
    if (this.contract && this.sourceNativeToken && this.sourcePublicClient) {
      const { abi } =
        this.crossInfo?.action === "issue"
          ? { abi: (await import("@/abi/backing-dvmevm.json")).default }
          : { abi: (await import("@/abi/mappingtoken-dvmevm.json")).default };
      const value = (await this.sourcePublicClient.readContract({
        address: this.contract.sourceAddress,
        abi,
        functionName: "currentFee",
      })) as unknown as bigint;
      return { value, token: this.sourceNativeToken };
    }
  }

  async getDailyLimit() {
    if (this.contract && this.sourceToken && this.targetToken && this.targetPublicClient) {
      const { abi } =
        this.crossInfo?.action === "issue"
          ? { abi: (await import("@/abi/mappingtoken-dvmevm.json")).default }
          : { abi: (await import("@/abi/backing-dvmevm.json")).default };

      const limit = (await this.targetPublicClient.readContract({
        address: this.contract.targetAddress,
        abi,
        functionName: "calcMaxWithdraw",
        args: [this.targetToken.address],
      })) as unknown as bigint;

      return { limit, spent: 0n, token: this.sourceToken };
    }
  }
}
