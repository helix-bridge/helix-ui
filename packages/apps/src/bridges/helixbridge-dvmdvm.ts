import { BridgeCategory } from "@/types/bridge";
import { BaseBridge } from "./base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { TransactionReceipt, createPublicClient, http } from "viem";
import { getChainConfig } from "@/utils/chain";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { SpecVersion } from "@polkadot/types/interfaces";
import { HistoryRecord } from "@/types/graphql";

/**
 * DVM <=> DVM
 */

export class HelixBridgeDVMDVM extends BaseBridge {
  private readonly gasLimit = 1000000n;

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
    if (this.sourceToken === "RING" || this.sourceToken === "xWRING") {
      this.contract = {
        sourceAddress: "0xF3c1444CD449bD66Ef6DA7CA6c3E7884840A3995",
        targetAddress: "0x8738A64392b71617aF4C685d0E827855c741fDF7",
      };
    } else if (this.sourceToken === "CRAB" || this.sourceToken === "xWCRAB") {
      this.contract = {
        sourceAddress: "0xCF8923ebF4244cedC647936a0281dd10bDFCBF18",
        targetAddress: "0x8c585F9791EE5b4B23fe82888cE576DBB69607eB",
      };
    }
  }

  async lock(_: string, recipient: string, amount: bigint, options?: { totalFee: bigint }) {
    if (this.contract && this.publicClient && this.walletClient && options) {
      const sourceChainConfig = getChainConfig(this.sourceChain);
      const targetChainConfig = getChainConfig(this.targetChain);

      const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);
      // const targetTokenConfig = targetChainConfig?.tokens.find((t) => t.symbol === this.targetToken);

      if (targetChainConfig?.rpcUrls.default.webSocket?.length && sourceTokenConfig) {
        const api = await ApiPromise.create({
          provider: new WsProvider(targetChainConfig.rpcUrls.default.webSocket.at(0)),
        });
        const specVersion = (
          api.consts.system.version as unknown as { specVersion: SpecVersion }
        ).specVersion.toNumber();

        const { args, value, functionName } =
          sourceTokenConfig.type === "native"
            ? {
                functionName: "lockAndRemoteIssuingNative",
                args: [specVersion, this.gasLimit, recipient, amount],
                value: amount + options.totalFee,
              }
            : {
                functionName: "lockAndRemoteIssuing",
                args: [specVersion, this.gasLimit, sourceTokenConfig.address, recipient, amount],
                value: options.totalFee,
              };
        const abi = (await import("@/abi/backing-dvmdvm.json")).default;

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
      const targetChainConfig = getChainConfig(this.targetChain);

      const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);
      // const targetTokenConfig = targetChainConfig?.tokens.find((t) => t.symbol === this.targetToken);

      if (targetChainConfig?.rpcUrls.default.webSocket?.length && sourceTokenConfig) {
        const api = await ApiPromise.create({
          provider: new WsProvider(targetChainConfig.rpcUrls.default.webSocket.at(0)),
        });
        const specVersion = (
          api.consts.system.version as unknown as { specVersion: SpecVersion }
        ).specVersion.toNumber();

        const { args, value, functionName } =
          sourceTokenConfig.type === "native"
            ? {
                functionName: "burnAndRemoteUnlockNative",
                args: [specVersion, this.gasLimit, recipient, amount],
                value: amount + options.totalFee,
              }
            : {
                functionName: "burnAndRemoteUnlock",
                args: [specVersion, this.gasLimit, sourceTokenConfig.address, recipient, amount],
                value: options.totalFee,
              };
        const abi = (await import("@/abi/mappingtoken-dvmdvm.json")).default;

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

  async refund(record: HistoryRecord) {
    const targetChainConfig = getChainConfig(this.targetChain);

    const sourceChainConfig = getChainConfig(this.sourceChain);
    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);

    const crossInfo = sourceTokenConfig?.cross.find(
      (c) =>
        c.bridge.category === this.category &&
        c.target.network === this.targetChain &&
        c.target.symbol === this.targetToken,
    );

    if (
      this.contract &&
      this.publicClient &&
      this.walletClient &&
      targetChainConfig?.rpcUrls.default.webSocket?.length
    ) {
      const api = await ApiPromise.create({
        provider: new WsProvider(targetChainConfig.rpcUrls.default.webSocket.at(0)),
      });
      const specVersion = (api.consts.system.version as unknown as { specVersion: SpecVersion }).specVersion.toNumber();

      const { abi, functionName } =
        crossInfo?.action === "issue"
          ? {
              abi: (await import("@/abi/backing-dvmdvm.json")).default,
              functionName: "remoteIssuingFailure",
            }
          : {
              abi: (await import("@/abi/mappingtoken-dvmdvm.json")).default,
              functionName: sourceTokenConfig?.type === "native" ? "remoteUnlockFailureNative" : "remoteUnlockFailure",
            };
      const args =
        sourceTokenConfig?.type === "native"
          ? [specVersion, this.gasLimit, record.messageNonce, record.sender, record.sendAmount]
          : [
              specVersion,
              this.gasLimit,
              record.messageNonce,
              record.sendTokenAddress,
              record.sender,
              record.sendAmount,
            ];
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

    if (this.contract && this.publicClient && sourceNativeTokenConfig) {
      const abi =
        crossInfo?.action === "redeem"
          ? (await import("@/abi/mappingtoken-dvmdvm.json")).default
          : (await import("@/abi/backing-dvmdvm.json")).default;

      const value = (await this.publicClient.readContract({
        address: this.contract.sourceAddress,
        abi,
        functionName: "fee",
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
        crossInfo?.action === "redeem"
          ? { abi: (await import("@/abi/backing-dvmdvm.json")).default, address: this.contract.sourceAddress }
          : { abi: (await import("@/abi/mappingtoken-dvmdvm.json")).default, address: this.contract.targetAddress };

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
