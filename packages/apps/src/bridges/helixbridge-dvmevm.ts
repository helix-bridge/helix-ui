import { BridgeCategory } from "@/types/bridge";
import { BaseBridge } from "./base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { Address, TransactionReceipt, createPublicClient, http } from "viem";
import { getChainConfig } from "@/utils/chain";
import { HistoryRecord } from "@/types/graphql";

/**
 * DVM <=> EVM
 */

export class HelixBridgeDVMEVM extends BaseBridge {
  private guard: Address | undefined;

  constructor(args: {
    category: BridgeCategory;

    sourceChain?: Network;
    targetChain?: Network;
    sourceToken?: TokenSymbol;
    targetToken?: TokenSymbol;

    publicClient?: PublicClient;
    walletClient?: WalletClient | null;
  }) {
    super(args);
    this.initContract();

    this.logo = {
      horizontal: "helix-horizontal.svg",
      symbol: "helix-symbol.svg",
    };
    this.name = "Helix(Legacy)";
  }

  private initContract() {
    if (this.sourceChain === "darwinia-dvm" && this.targetChain === "ethereum") {
      this.contract = {
        sourceAddress: "0xD1B10B114f1975d8BCc6cb6FC43519160e2AA978",
        targetAddress: "0xFBAD806Bdf9cEC2943be281FB355Da05068DE925",
      };
      this.guard = "0x61B6B8c7C00aA7F060a2BEDeE6b11927CC9c3eF1";
    }
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
        const abi = (await import("@/abi/backing-dvmevm.json")).default;

        const hash = await this.walletClient.writeContract({
          address: this.contract.sourceAddress,
          abi,
          functionName,
          args,
          value,
          gas: this.getTxGasLimit(),
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
        const abi = (await import("@/abi/mappingtoken-dvmevm.json")).default;

        const hash = await this.walletClient.writeContract({
          address: this.contract.sourceAddress,
          abi,
          functionName,
          args,
          value,
          gas: this.getTxGasLimit(),
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

    const crossInfo = sourceTokenConfig?.cross.find(
      (c) =>
        c.bridge.category === this.category &&
        c.target.network === this.targetChain &&
        c.target.symbol === this.targetToken,
    );

    if (crossInfo?.action === "redeem") {
      return this.burn(sender, recipient, amount, options);
    } else {
      return this.lock(sender, recipient, amount, options);
    }
  }

  async claim(record: HistoryRecord) {
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
      return await this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async refund(record: HistoryRecord) {
    const sourceChainConfig = getChainConfig(this.sourceChain);
    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);

    const crossInfo = sourceTokenConfig?.cross.find(
      (c) =>
        c.bridge.category === this.category &&
        c.target.network === this.targetChain &&
        c.target.symbol === this.targetToken,
    );

    if (this.contract && this.publicClient && this.walletClient) {
      const { abi, functionName } =
        crossInfo?.action === "issue"
          ? {
              abi: (await import("@/abi/backing-dvmevm.json")).default,
              functionName: "remoteIssuingFailure",
            }
          : {
              abi: (await import("@/abi/mappingtoken-dvmevm.json")).default,
              functionName: sourceTokenConfig?.type === "native" ? "remoteUnlockFailureNative" : "remoteUnlockFailure",
            };
      const args =
        sourceTokenConfig?.type === "native"
          ? [record.id.split("-").slice(-1), record.sender, record.sendAmount]
          : [record.id.split("-").slice(-1), record.sendTokenAddress, record.sender, record.sendAmount];
      const value = (await this.getFee())?.value || 0n;

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
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
    const sourceChainConfig = getChainConfig(this.sourceChain);

    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);
    const sourceNativeTokenConfig = sourceChainConfig?.tokens.find((t) => t.type === "native");

    const crossInfo = sourceTokenConfig?.cross.find(
      (c) =>
        c.bridge.category === this.category &&
        c.target.network === this.targetChain &&
        c.target.symbol === this.targetToken,
    );
    const publicClient = createPublicClient({ chain: sourceChainConfig, transport: http() });

    if (this.contract && sourceNativeTokenConfig) {
      const { abi, address } =
        crossInfo?.action === "issue"
          ? { abi: (await import("@/abi/backing-dvmevm.json")).default, address: this.contract.sourceAddress }
          : { abi: (await import("@/abi/mappingtoken-dvmevm.json")).default, address: this.contract.targetAddress };

      const value = (await publicClient.readContract({
        address,
        abi,
        functionName: "currentFee",
      })) as unknown as bigint;
      return { value, token: sourceNativeTokenConfig };
    }
  }

  async getDailyLimit() {
    const sourceChainConfig = getChainConfig(this.sourceChain);
    const targetChainConfig = getChainConfig(this.targetChain);

    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);
    const targetTokenConfig = targetChainConfig?.tokens.find((t) => t.symbol === this.targetToken);

    const crossInfo = sourceTokenConfig?.cross.find(
      (c) =>
        c.bridge.category === this.category &&
        c.target.network === this.targetChain &&
        c.target.symbol === this.targetToken,
    );
    const publicClient = createPublicClient({ chain: targetChainConfig, transport: http() });

    if (this.contract && sourceTokenConfig && targetTokenConfig) {
      const { abi, address } =
        crossInfo?.action === "issue"
          ? { abi: (await import("@/abi/mappingtoken-dvmevm.json")).default, address: this.contract.targetAddress }
          : { abi: (await import("@/abi/backing-dvmevm.json")).default, address: this.contract.sourceAddress };

      const limit = (await publicClient.readContract({
        address,
        abi,
        functionName: "calcMaxWithdraw",
        args: [targetTokenConfig.address],
      })) as unknown as bigint;

      return { limit, spent: 0n, token: sourceTokenConfig };
    }
  }
}
