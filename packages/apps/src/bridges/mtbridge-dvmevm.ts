import { BridgeCategory, BridgeContract } from "@/types/bridge";
import { BaseBridge } from "./base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { TransactionReceipt } from "viem";
import { getChainConfig } from "@/utils/chain";
import { Record } from "@/types/graphql";

/**
 * Mapping Token protocol
 * DVM <=> EVM
 */

export class MtBridgeDVMEVM extends BaseBridge {
  constructor(args: {
    category: BridgeCategory;
    contract?: BridgeContract;

    sourceChain?: Network;
    targetChain?: Network;
    sourceToken?: TokenSymbol;
    targetToken?: TokenSymbol;

    publicClient?: PublicClient;
    walletClient?: WalletClient | null;
  }) {
    super(args);

    this.logo = {
      horizontal: "helix-horizontal.svg",
      symbol: "helix-symbol.svg",
    };
    this.name = "Helix(Legacy)";
  }

  async lock(_: string, recipient: string, amount: bigint, options?: { totalFee: bigint }) {
    if (this.contract && this.publicClient && this.walletClient && options) {
      const sourceChainConfig = getChainConfig(this.sourceChain);
      const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);

      if (sourceTokenConfig) {
        const { args, value, functionName } =
          sourceTokenConfig?.type === "native"
            ? {
                functionName: "lockAndRemoteIssuingNative",
                args: [recipient, amount],
                value: amount + options.totalFee,
              }
            : {
                functionName: "lockAndRemoteIssuing",
                args: [sourceTokenConfig.address, recipient, amount],
                value: options.totalFee,
              };
        const gas = this.sourceChain === "arbitrum" || this.sourceChain === "arbitrum-goerli" ? 1000000n : undefined;
        const abi = (await import("@/abi/backing-dvmevm.json")).default;

        const hash = await this.walletClient.writeContract({
          address: this.contract.sourceAddress,
          abi,
          functionName,
          args,
          value,
          gas,
        });
        return await this.publicClient.waitForTransactionReceipt({ hash });
      }
    }
  }

  async burn(_: string, recipient: string, amount: bigint, options?: { totalFee: bigint }) {
    if (this.contract && this.publicClient && this.walletClient && options) {
      const sourceChainConfig = getChainConfig(this.sourceChain);
      const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);

      if (sourceTokenConfig) {
        const { args, value, functionName } =
          sourceTokenConfig?.type === "native"
            ? {
                functionName: "burnAndRemoteUnlockNative",
                args: [recipient, amount],
                value: amount + options.totalFee,
              }
            : {
                functionName: "burnAndRemoteUnlock",
                args: [sourceTokenConfig.address, recipient, amount],
                value: options.totalFee,
              };
        const gas = this.sourceChain === "arbitrum" || this.sourceChain === "arbitrum-goerli" ? 1000000n : undefined;
        const abi = (await import("@/abi/mappingtoken-dvmevm.json")).default;

        const hash = await this.walletClient.writeContract({
          address: this.contract.sourceAddress,
          abi,
          functionName,
          args,
          value,
          gas,
        });
        return await this.publicClient.waitForTransactionReceipt({ hash });
      }
    }
  }

  async transfer(
    sender: string,
    recipient: string,
    amount: bigint,
    options?: { totalFee: bigint },
  ): Promise<TransactionReceipt | undefined> {
    const sourceChainConfig = getChainConfig(this.sourceChain);
    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);

    if (sourceTokenConfig?.type === "mapping") {
      return this.burn(sender, recipient, amount, options);
    } else {
      return this.lock(sender, recipient, amount, options);
    }
  }

  async claim(record: Record) {
    if (this.contract && this.publicClient && this.walletClient) {
      const gas = this.sourceChain === "arbitrum" || this.sourceChain === "arbitrum-goerli" ? 1000000n : undefined;
      const abi = (await import("@/abi/guard.json")).default;

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
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
        gas,
      });
      return await this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async refund(record: Record) {
    const targetChainConfig = getChainConfig(this.targetChain);
    const targetTokenConfig = targetChainConfig?.tokens.find((t) => t.symbol === this.targetToken);

    if (this.contract && this.publicClient && this.walletClient) {
      const { abi, functionName } =
        targetTokenConfig?.type === "mapping"
          ? {
              abi: (await import("@/abi/backing-dvmevm.json")).default,
              functionName: "remoteIssuingFailure",
            }
          : {
              abi: (await import("@/abi/mappingtoken-dvmevm.json")).default,
              functionName: targetTokenConfig?.type === "native" ? "remoteUnlockFailureNative" : "remoteUnlockFailure",
            };
      const args =
        functionName === "remoteUnlockFailureNative"
          ? [record.id.split("-").slice(-1), record.sender, record.sendAmount]
          : [record.id.split("-").slice(-1), record.sendTokenAddress, record.sender, record.sendAmount];
      const value = (await this.getFee())?.amount || 0n;
      const gas = this.sourceChain === "arbitrum" || this.sourceChain === "arbitrum-goerli" ? 1000000n : undefined;

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi,
        functionName,
        args,
        value,
        gas,
      });
      return await this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async getFee() {
    const sourceChainConfig = getChainConfig(this.sourceChain);

    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);
    const sourceNativeTokenConfig = sourceChainConfig?.tokens.find((t) => t.type === "native");

    if (this.contract && this.publicClient && sourceNativeTokenConfig) {
      const abi =
        sourceTokenConfig?.type === "mapping"
          ? (await import("@/abi/mappingtoken-dvmevm.json")).default
          : (await import("@/abi/backing-dvmevm.json")).default;

      const amount = (await this.publicClient.readContract({
        address: this.contract.sourceAddress,
        abi,
        functionName: "currentFee",
      })) as unknown as bigint;
      return { amount, symbol: sourceNativeTokenConfig.symbol };
    }

    return undefined;
  }

  async getDailyLimit() {
    const sourceChainConfig = getChainConfig(this.sourceChain);
    const targetChainConfig = getChainConfig(this.targetChain);

    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);
    const targetTokenConfig = targetChainConfig?.tokens.find((t) => t.symbol === this.targetToken);

    if (this.contract && this.publicClient && targetTokenConfig) {
      const abi =
        sourceTokenConfig?.type === "mapping"
          ? (await import("@/abi/mappingtoken-dvmevm.json")).default
          : (await import("@/abi/backing-dvmevm.json")).default;

      const limit = (await this.publicClient.readContract({
        address: this.contract.sourceAddress,
        abi,
        functionName: "calcMaxWithdraw",
        args: [targetTokenConfig.address],
      })) as unknown as bigint;

      return { limit, spent: 0n };
    }

    return undefined;
  }
}
