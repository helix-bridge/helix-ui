import { BridgeCategory, BridgeLogo } from "@/types/bridge";
import { BaseBridge } from "./base";
import { ChainConfig } from "@/types/chain";
import { Token } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { TransactionReceipt } from "viem";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { SpecVersion } from "@polkadot/types/interfaces";
import { HistoryRecord } from "@/types/graphql";

/**
 * DVM <=> DVM
 */

export class HelixBridgeDVMDVM extends BaseBridge {
  private readonly gasLimit = 1000000n;
  private specVersion?: { source: number; target: number };

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
    this.initSpecVersion();

    this.logo = args.logo ?? {
      horizontal: "helix-horizontal.svg",
      symbol: "helix-symbol.svg",
    };
    this.name = "Helix(Legacy)";
  }

  private initContract() {
    if (this.sourceToken?.symbol === "RING" || this.sourceToken?.symbol === "xWRING") {
      this.contract = {
        sourceAddress: "0xF3c1444CD449bD66Ef6DA7CA6c3E7884840A3995",
        targetAddress: "0x8738A64392b71617aF4C685d0E827855c741fDF7",
      };
    } else if (this.sourceToken?.symbol === "CRAB" || this.sourceToken?.symbol === "xWCRAB") {
      this.contract = {
        sourceAddress: "0xCF8923ebF4244cedC647936a0281dd10bDFCBF18",
        targetAddress: "0x8c585F9791EE5b4B23fe82888cE576DBB69607eB",
      };
    }
  }

  private async initSpecVersion() {
    const sourceRpc = this.sourceChain?.rpcUrls.default.webSocket?.at(0);
    const targetRpc = this.targetChain?.rpcUrls.default.webSocket?.at(0);

    const source = sourceRpc
      ? (
          (await ApiPromise.create({ provider: new WsProvider(sourceRpc) })).consts.system.version as unknown as {
            specVersion: SpecVersion;
          }
        ).specVersion.toNumber()
      : 0;
    const target = targetRpc
      ? (
          (await ApiPromise.create({ provider: new WsProvider(targetRpc) })).consts.system.version as unknown as {
            specVersion: SpecVersion;
          }
        ).specVersion.toNumber()
      : 0;

    this.specVersion = { source, target };
  }

  private async lock(_: string, recipient: string, amount: bigint, options?: { totalFee: bigint }) {
    if (options && this.contract && this.specVersion && this.sourceToken && this.publicClient && this.walletClient) {
      const { args, value, functionName } =
        this.sourceToken.type === "native"
          ? {
              functionName: "lockAndRemoteIssuingNative",
              args: [this.specVersion.target, this.gasLimit, recipient, amount],
              value: amount + options.totalFee,
            }
          : {
              functionName: "lockAndRemoteIssuing",
              args: [this.specVersion.target, this.gasLimit, this.sourceToken.address, recipient, amount],
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
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  private async burn(_: string, recipient: string, amount: bigint, options?: { totalFee: bigint }) {
    if (options && this.contract && this.specVersion && this.sourceToken && this.publicClient && this.walletClient) {
      const { args, value, functionName } =
        this.sourceToken.type === "native"
          ? {
              functionName: "burnAndRemoteUnlockNative",
              args: [this.specVersion.target, this.gasLimit, recipient, amount],
              value: amount + options.totalFee,
            }
          : {
              functionName: "burnAndRemoteUnlock",
              args: [this.specVersion.target, this.gasLimit, this.sourceToken.address, recipient, amount],
              value: options.totalFee,
            };
      const abi = (await import("@/abi/mappingtoken-dvmdvm.json")).default;

      const hash = await this.walletClient.writeContract({
        address: this.contract.targetAddress,
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
    options?: { totalFee: bigint },
  ): Promise<TransactionReceipt | undefined> {
    await this.validateNetwork("source");

    if (this.crossInfo?.action === "redeem") {
      return this.burn(sender, recipient, amount, options);
    } else {
      return this.lock(sender, recipient, amount, options);
    }
  }

  async refund(record: HistoryRecord) {
    await this.validateNetwork("target");

    if (this.contract && this.specVersion && this.publicClient && this.walletClient) {
      const { abi, address, functionName } =
        this.crossInfo?.action === "issue"
          ? {
              abi: (await import("@/abi/mappingtoken-dvmdvm.json")).default,
              address: this.contract.targetAddress,
              functionName: "remoteIssuingFailure",
            }
          : {
              abi: (await import("@/abi/backing-dvmdvm.json")).default,
              address: this.contract.sourceAddress,
              functionName: this.sourceToken?.type === "native" ? "remoteUnlockFailureNative" : "remoteUnlockFailure",
            };
      const args =
        this.sourceToken?.type === "native"
          ? [this.specVersion.source, this.gasLimit, record.messageNonce, record.sender, record.sendAmount]
          : [
              this.specVersion.source,
              this.gasLimit,
              record.messageNonce,
              record.sendTokenAddress,
              record.sender,
              record.sendAmount,
            ];
      const value = (await this.getFee())?.value;

      const hash = await this.walletClient.writeContract({
        address,
        abi,
        functionName,
        args,
        value,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async getFee() {
    if (this.contract && this.sourceNativeToken && this.sourcePublicClient) {
      const { abi, address } =
        this.crossInfo?.action === "issue"
          ? { abi: (await import("@/abi/backing-dvmdvm.json")).default, address: this.contract.sourceAddress }
          : { abi: (await import("@/abi/mappingtoken-dvmdvm.json")).default, address: this.contract.targetAddress };

      const value = (await this.sourcePublicClient.readContract({
        address,
        abi,
        functionName: "fee",
      })) as unknown as bigint;
      return { value, token: this.sourceNativeToken };
    }
  }

  async getDailyLimit() {
    if (this.contract && this.sourceToken && this.targetToken && this.targetPublicClient) {
      const { abi, address } =
        this.crossInfo?.action === "redeem"
          ? { abi: (await import("@/abi/backing-dvmdvm.json")).default, address: this.contract.sourceAddress }
          : { abi: (await import("@/abi/mappingtoken-dvmdvm.json")).default, address: this.contract.targetAddress };

      const limit = (await this.targetPublicClient.readContract({
        address,
        abi,
        functionName: "calcMaxWithdraw",
        args: [this.targetToken.address],
      })) as unknown as bigint;

      return { limit, spent: 0n, token: this.sourceToken };
    }
  }
}
