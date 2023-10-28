import { BridgeCategory, BridgeLogo, TransferOptions } from "@/types/bridge";
import { BaseBridge } from "./base";
import { ChainConfig } from "@/types/chain";
import { Token } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { Address, TransactionReceipt } from "viem";
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
    this.ensureSpecVersion();

    this.logo = args.logo ?? {
      horizontal: "helix-horizontal.svg",
      symbol: "helix-symbol.svg",
    };
    this.name = "Helix(Legacy)";
  }

  private initContract() {
    if (this.sourceToken?.symbol === "RING" || this.sourceToken?.symbol === "xWRING") {
      const backing = "0xF3c1444CD449bD66Ef6DA7CA6c3E7884840A3995";
      const issuing = "0x8738A64392b71617aF4C685d0E827855c741fDF7";
      this.initContractFromBackingIssuing(backing, issuing);
    } else if (this.sourceToken?.symbol === "CRAB" || this.sourceToken?.symbol === "xWCRAB") {
      const backing = "0xCF8923ebF4244cedC647936a0281dd10bDFCBF18";
      const issuing = "0x8c585F9791EE5b4B23fe82888cE576DBB69607eB";
      this.initContractFromBackingIssuing(backing, issuing);
    }
  }

  private async ensureSpecVersion() {
    if (!this.specVersion) {
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
  }

  private async lock(
    account: Address,
    _: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { estimateGas?: boolean },
  ) {
    if (this.contract && this.specVersion && this.sourceToken && this.sourcePublicClient) {
      const totalFee = options?.totalFee ?? 0n;
      const estimateGas = options?.estimateGas ?? false;

      const abi = (await import("@/abi/backing-dvmdvm")).default;
      const address = this.contract.sourceAddress;
      const gas = this.getTxGasLimit();

      const defaultParams = {
        address,
        abi,
        gas,
        functionName: "lockAndRemoteIssuing",
        args: [this.specVersion.target, this.gasLimit, this.sourceToken.address, recipient, amount],
        value: totalFee,
        account,
      } as const;
      const nativeParams = {
        address,
        abi,
        gas,
        functionName: "lockAndRemoteIssuingNative",
        args: [this.specVersion.target, this.gasLimit, recipient, amount],
        value: amount + totalFee,
        account,
      } as const;

      if (estimateGas) {
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
    options?: TransferOptions & { estimateGas?: boolean },
  ) {
    if (this.contract && this.specVersion && this.sourceToken && this.sourcePublicClient) {
      const abi = (await import("@/abi/mappingtoken-dvmdvm")).default;
      const address = this.contract.sourceAddress;
      const gas = this.getTxGasLimit();
      const value = options?.totalFee ?? 0n;
      const estimateGas = options?.estimateGas ?? false;

      const defaultParams = {
        address,
        abi,
        gas,
        value,
        functionName: "burnAndRemoteUnlock",
        args: [this.specVersion.target, this.gasLimit, this.sourceToken.address, recipient, amount],
        account,
      } as const;
      const nativeParams = {
        address,
        abi,
        gas,
        value,
        functionName: "burnAndRemoteUnlockNative",
        args: [this.specVersion.target, this.gasLimit, recipient, amount],
        account,
      } as const;

      if (estimateGas) {
        return this.targetToken?.type === "native"
          ? this.sourcePublicClient.estimateContractGas(nativeParams)
          : this.sourcePublicClient.estimateContractGas(defaultParams);
      } else if (this.walletClient) {
        const hash = await (this.targetToken?.type === "native"
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
    options?: TransferOptions & { estimateGas?: boolean },
  ): Promise<bigint | TransactionReceipt | undefined> {
    await this.ensureSpecVersion();
    const account = await this.getSigner();

    if (this.crossInfo?.action === "redeem") {
      return account && this.burn(account, sender, recipient, amount, options);
    } else {
      return account && this.lock(account, sender, recipient, amount, options);
    }
  }

  async refund(record: HistoryRecord) {
    await this.validateNetwork("target");
    await this.ensureSpecVersion();

    if (this.contract && this.specVersion && this.publicClient && this.walletClient) {
      const value = (await this.getFee())?.value;
      const address = this.contract.targetAddress;
      const gas = this.getTxGasLimit();
      let hash: Address | undefined;

      const messageNonce = BigInt(record.messageNonce || 0);
      const sendAmount = BigInt(record.sendAmount);
      const sendTokenAddress = record.sendTokenAddress || "0x";

      if (this.crossInfo?.action === "issue") {
        const abi = (await import("@/abi/mappingtoken-dvmdvm")).default;
        if (this.sourceToken?.type === "native") {
          hash = await this.walletClient.writeContract({
            address,
            value,
            abi,
            gas,
            functionName: "remoteUnlockFailureNative",
            args: [this.specVersion.source, this.gasLimit, messageNonce, record.sender, sendAmount],
          });
        } else {
          hash = await this.walletClient.writeContract({
            address,
            value,
            abi,
            gas,
            functionName: "remoteUnlockFailure",
            args: [this.specVersion.source, this.gasLimit, messageNonce, sendTokenAddress, record.sender, sendAmount],
          });
        }
      } else {
        const abi = (await import("@/abi/backing-dvmdvm")).default;
        hash = await this.walletClient.writeContract({
          address,
          value,
          abi,
          gas,
          functionName: "remoteIssuingFailure",
          args: [this.specVersion.source, this.gasLimit, messageNonce, sendTokenAddress, record.sender, sendAmount],
        });
      }
      return hash && this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async getFee() {
    if (this.contract && this.sourceNativeToken && this.sourcePublicClient) {
      const functionName = "fee" as const;
      const address = this.contract.sourceAddress;

      const value = await (this.crossInfo?.action === "issue"
        ? this.sourcePublicClient.readContract({
            address,
            functionName,
            abi: (await import("@/abi/backing-dvmdvm")).default,
          })
        : this.sourcePublicClient.readContract({
            address,
            functionName,
            abi: (await import("@/abi/mappingtoken-dvmdvm")).default,
          }));
      return { value, token: this.sourceNativeToken };
    }
  }

  async getDailyLimit() {
    if (this.contract && this.sourceToken && this.targetToken && this.targetPublicClient) {
      const address = this.contract.targetAddress;
      const functionName = "calcMaxWithdraw" as const;
      const args = [this.targetToken.address] as const;

      const limit = await (this.crossInfo?.action === "redeem"
        ? this.targetPublicClient.readContract({
            address,
            functionName,
            args,
            abi: (await import("@/abi/backing-dvmdvm")).default,
          })
        : this.targetPublicClient.readContract({
            address,
            functionName,
            args,
            abi: (await import("@/abi/mappingtoken-dvmdvm")).default,
          }));

      return { limit, spent: 0n, token: this.sourceToken };
    }
  }
}
