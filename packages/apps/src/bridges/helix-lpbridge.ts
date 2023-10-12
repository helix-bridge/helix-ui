import { BridgeCategory, BridgeLogo } from "@/types/bridge";
import { BaseBridge } from "./base";
import { ChainConfig } from "@/types/chain";
import { Token } from "@/types/token";
import { WalletClient, PublicClient } from "wagmi";
import { TransactionReceipt } from "viem";
import { HistoryRecord } from "@/types/graphql";

export class HelixLpBridge extends BaseBridge {
  private readonly prefix = BigInt("0x6878000000000000");
  private readonly feePercent = 0.003; // 0.3%
  private readonly relayGasLimit = 100000n;

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

    if (!args.logo) {
      this.logo = {
        horizontal: "helix-horizontal.svg",
        symbol: "helix-symbol.svg",
      };
    }
    this.name = "Helix(Fusion)";
    this.estimateTime = { min: 1, max: 3 };
  }

  private initContract() {
    this.contract = {
      sourceAddress: "0x84f7a56483C100ECb12CbB4A31b7873dAE0d8E9B",
      targetAddress: "0x5F8D4232367759bCe5d9488D3ade77FCFF6B9b6B",
    };
  }

  async transfer(
    _: string,
    recipient: string,
    amount: bigint,
    options?: { totalFee: bigint },
  ): Promise<TransactionReceipt | undefined> {
    if (options && this.contract && this.crossInfo && this.walletClient) {
      const nonce = BigInt(Date.now()) + this.prefix;

      const { args, value, functionName } =
        this.sourceToken?.type === "native"
          ? {
              functionName: "lockNativeAndRemoteIssuing",
              args: [amount, options.totalFee, recipient, nonce, this.targetToken?.type === "native"],
              value: amount + options.totalFee,
            }
          : {
              functionName: "lockAndRemoteIssuing",
              args: [
                nonce,
                recipient,
                amount,
                options.totalFee,
                this.crossInfo?.index,
                this.targetToken?.type === "native",
              ],
              value: undefined,
            };
      const address = this.crossInfo.action === "issue" ? this.contract.sourceAddress : this.contract.targetAddress;
      const abi = (await import("@/abi/lpbridge.json")).default;

      const hash = await this.walletClient.writeContract({
        address,
        abi,
        functionName,
        args,
        value,
        gas: this.getTxGasLimit(),
      });
      return await this.sourcePublicClient.waitForTransactionReceipt({ hash });
    }
  }

  /**
   * On target chain
   */
  async refund(record: HistoryRecord) {
    if (this.targetChain?.id !== (await this.publicClient?.getChainId())) {
      throw new Error("Wrong network");
    }

    if (this.contract && this.publicClient && this.walletClient) {
      const { address } =
        this.crossInfo?.action === "issue"
          ? { address: this.contract.targetAddress }
          : { address: this.contract.sourceAddress };
      const args = [
        record.messageNonce,
        this.targetToken?.type === "native",
        record.recvTokenAddress,
        record.sender,
        record.recipient,
        record.sendAmount,
        record.id.split("-").at(1),
        this.sourceToken?.type === "native",
      ];
      const value = await this.getBridgeFee();
      const abi = (await import("@/abi/lpbridge-sub2eth.json")).default;

      const hash = await this.walletClient.writeContract({
        address,
        abi,
        functionName: "requestCancelIssuing",
        args,
        value,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  private async getBridgeFee() {
    if (this.contract) {
      const address = this.crossInfo?.action === "issue" ? this.contract.sourceAddress : this.contract.targetAddress;
      const abi = (await import("@/abi/lpbridge.json")).default;
      return this.sourcePublicClient.readContract({
        address,
        abi,
        functionName: "fee",
      }) as unknown as bigint; // Native token
    }
  }

  async speedUp(record: HistoryRecord, fee: bigint) {
    if (this.contract && this.walletClient) {
      const transferId = record.id.split("-").slice(-1);

      const { args, value, functionName } =
        this.sourceToken?.type === "native"
          ? {
              functionName: "increaseNativeFee",
              args: [transferId],
              value: fee,
            }
          : {
              functionName: "increaseFee",
              args: [transferId, fee],
              value: undefined,
            };
      const address = this.crossInfo?.action === "issue" ? this.contract.sourceAddress : this.contract.targetAddress;
      const abi = (await import("@/abi/lpbridge.json")).default;

      const hash = await this.walletClient.writeContract({
        address,
        abi,
        functionName,
        args,
        value,
        gas: this.getTxGasLimit(),
      });
      return await this.sourcePublicClient.waitForTransactionReceipt({ hash });
    }
  }

  async getFee(args?: { baseFee?: bigint; liquidityFeeRate?: bigint; transferAmount?: bigint }) {
    if (this.sourceToken && this.crossInfo?.baseFee) {
      let value = ((args?.transferAmount || 0n) * BigInt(this.feePercent * 1000)) / 1000n + this.crossInfo.baseFee;

      if (this.crossInfo.price) {
        const gasPrice = await this.sourcePublicClient.getGasPrice();
        const dynamicFee = gasPrice * this.crossInfo.price * this.relayGasLimit;
        value += dynamicFee;
      }

      return { value, token: this.sourceToken };
    }
  }

  async getDailyLimit() {
    if (this.sourceToken) {
      return { limit: BigInt("500000000000000000000000"), spent: 0n, token: this.sourceToken };
    }
  }
}
