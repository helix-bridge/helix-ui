import { BridgeCategory, BridgeContract } from "@/types/bridge";
import { BaseBridge } from "./base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { TransactionReceipt, parseUnits } from "viem";
import { getChainConfig } from "@/utils/chain";
import { Record } from "@/types/graphql";

export class LpBridge extends BaseBridge {
  private readonly prefix = BigInt("0x6878000000000000");
  private readonly feePercent = 0.003; // 0.3%
  private readonly relayGasLimit = 100000n;

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
    this.name = "Helix(Fusion)";
  }

  async transfer(
    _: string,
    recipient: string,
    amount: bigint,
    options?: { totalFee: bigint },
  ): Promise<TransactionReceipt | undefined> {
    const sourceChainConfig = getChainConfig(this.sourceChain);
    const targetChainConfig = getChainConfig(this.targetChain);

    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);
    const targetTokenConfig = targetChainConfig?.tokens.find((t) => t.symbol === this.targetToken);

    if (this.contract && this.publicClient && this.walletClient && options) {
      const nonce = BigInt(Date.now()) + this.prefix;
      const tokenIndex = 0; // TODO

      const { args, value, functionName } =
        sourceTokenConfig?.type === "native"
          ? {
              functionName: "lockNativeAndRemoteIssuing",
              args: [amount, options.totalFee, recipient, nonce, targetTokenConfig?.type === "native"],
              value: amount + options.totalFee,
            }
          : {
              functionName: "lockAndRemoteIssuing",
              args: [nonce, recipient, amount, options.totalFee, tokenIndex, targetTokenConfig?.type === "native"],
              value: undefined,
            };
      const gas = this.sourceChain === "arbitrum" || this.sourceChain === "arbitrum-goerli" ? 1000000n : undefined;
      const abi = (await import("@/abi/lpbridge.json")).default;

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

  async refund(record: Record) {
    const sourceChainConfig = getChainConfig(this.sourceChain);
    const targetChainConfig = getChainConfig(this.targetChain);

    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);
    const targetTokenConfig = targetChainConfig?.tokens.find((t) => t.symbol === this.targetToken);

    if (this.contract && this.publicClient && this.walletClient) {
      const args = [
        record.messageNonce,
        targetTokenConfig?.type === "native",
        record.recvTokenAddress,
        record.sender,
        record.recipient,
        record.sendAmount,
        record.id.split("-").at(1),
        sourceTokenConfig?.type === "native",
      ];
      const value = await this.getBridgeFee();
      const gas = this.sourceChain === "arbitrum" || this.sourceChain === "arbitrum-goerli" ? 1000000n : undefined;
      const abi = (await import("@/abi/lpbridge-sub2eth.json")).default;

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi,
        functionName: "requestCancelIssuing",
        args,
        value,
        gas,
      });
      return await this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  private async getBridgeFee() {
    if (this.contract && this.publicClient) {
      const abi = (await import("@/abi/lpbridge-sub2eth.json")).default;
      const fee = this.publicClient.readContract({
        address: this.contract.sourceAddress,
        abi,
        functionName: "fee",
      }) as unknown as bigint;

      return fee;
    }
  }

  async speedUp(record: Record, newFee: bigint) {
    const sourceChainConfig = getChainConfig(this.sourceChain);
    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);

    if (this.contract && this.publicClient && this.walletClient) {
      const { args, value, functionName } =
        sourceTokenConfig?.type === "native"
          ? {
              functionName: "increaseNativeFee",
              args: [record.id.split("-").slice(-1)],
              value: newFee,
            }
          : {
              functionName: "increaseFee",
              args: [record.id.split("-").slice(-1), newFee],
              value: undefined,
            };
      const gas = this.sourceChain === "arbitrum" || this.sourceChain === "arbitrum-goerli" ? 1000000n : undefined;
      const abi = (await import("@/abi/lpbridge.json")).default;

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

  async getFee(transferAmount: bigint) {
    const sourceChainConfig = getChainConfig(this.sourceChain);
    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);

    if (sourceTokenConfig && this.publicClient) {
      const baseFee = parseUnits("3000", sourceTokenConfig.decimals);
      let amount = (transferAmount * BigInt(this.feePercent * 1000)) / 1000n + baseFee;

      if (sourceTokenConfig.type === "native") {
        const gasPrice = await this.publicClient.getGasPrice();
        const price = 440000n;
        const dynamicFee = gasPrice * price * this.relayGasLimit;
        amount += dynamicFee;
      }

      return {
        amount,
        symbol: sourceTokenConfig.symbol,
      };
    }

    return undefined;
  }

  getEstimateTime() {
    return "1-3 Minutes";
  }

  async getDailyLimit() {
    return { limit: BigInt("500000000000000000000000"), spent: 0n };
  }
}
