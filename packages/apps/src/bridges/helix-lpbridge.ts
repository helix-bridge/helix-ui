import { BridgeCategory, BridgeContract } from "@/types/bridge";
import { BaseBridge } from "./base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { TransactionReceipt } from "viem";
import { getChainConfig } from "@/utils/chain";
import { HistoryRecord } from "@/types/graphql";

export class HelixLpBridge extends BaseBridge {
  private readonly prefix = BigInt("0x6878000000000000");
  private readonly feePercent = 0.003; // 0.3%
  private readonly relayGasLimit = 100000n;

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
    this.name = "Helix(Fusion)";
    this.estimateTime = { min: 1, max: 3 };
  }

  private initContract() {
    if (this.sourceChain === "darwinia-dvm" && this.targetChain === "ethereum") {
      this.contract = {
        sourceAddress: "0x84f7a56483C100ECb12CbB4A31b7873dAE0d8E9B",
        targetAddress: "0x5F8D4232367759bCe5d9488D3ade77FCFF6B9b6B",
      };
    } else if (this.sourceChain === "ethereum" && this.targetChain === "darwinia-dvm") {
      this.contract = {
        sourceAddress: "0x5F8D4232367759bCe5d9488D3ade77FCFF6B9b6B",
        targetAddress: "0x84f7a56483C100ECb12CbB4A31b7873dAE0d8E9B",
      };
    }
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

    const crossInfo = sourceTokenConfig?.cross.find(
      (c) =>
        c.bridge.category === this.category &&
        c.target.network === this.targetChain &&
        c.target.symbol === this.targetToken,
    );

    if (this.contract && this.publicClient && this.walletClient && options) {
      const nonce = BigInt(Date.now()) + this.prefix;

      const { args, value, functionName } =
        sourceTokenConfig?.type === "native"
          ? {
              functionName: "lockNativeAndRemoteIssuing",
              args: [amount, options.totalFee, recipient, nonce, targetTokenConfig?.type === "native"],
              value: amount + options.totalFee,
            }
          : {
              functionName: "lockAndRemoteIssuing",
              args: [
                nonce,
                recipient,
                amount,
                options.totalFee,
                crossInfo?.index,
                targetTokenConfig?.type === "native",
              ],
              value: undefined,
            };
      const abi = (await import("@/abi/lpbridge.json")).default;

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

  async refund(record: HistoryRecord) {
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
      const abi = (await import("@/abi/lpbridge-sub2eth.json")).default;

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi,
        functionName: "requestCancelIssuing",
        args,
        value,
        gas: this.getTxGasLimit(),
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

  async speedUp(record: HistoryRecord, newFee: bigint) {
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
      const abi = (await import("@/abi/lpbridge.json")).default;

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

  async getFee(args?: { baseFee?: bigint; liquidityFeeRate?: bigint; transferAmount?: bigint }) {
    const sourceChainConfig = getChainConfig(this.sourceChain);
    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);

    const crossInfo = sourceTokenConfig?.cross.find(
      (c) =>
        c.bridge.category === this.category &&
        c.target.network === this.targetChain &&
        c.target.symbol === this.targetToken,
    );

    if (sourceTokenConfig && this.publicClient && crossInfo?.baseFee) {
      let value = ((args?.transferAmount || 0n) * BigInt(this.feePercent * 1000)) / 1000n + crossInfo.baseFee;

      if (crossInfo.price) {
        const gasPrice = await this.publicClient.getGasPrice();
        const dynamicFee = gasPrice * crossInfo.price * this.relayGasLimit;
        value += dynamicFee;
      }

      return {
        value,
        token: sourceTokenConfig,
      };
    }
  }

  async getDailyLimit() {
    if (this.sourceToken) {
      const token = getChainConfig(this.sourceChain)?.tokens.find((t) => t.symbol === this.sourceToken);
      if (token) {
        return { limit: BigInt("500000000000000000000000"), spent: 0n, token };
      }
    }
  }
}
