import { BridgeCategory, BridgeContract, BridgeLogoType } from "@/types/bridge";
import { Network } from "@/types/chain";
import { HistoryRecord } from "@/types/graphql";
import { Token, TokenSymbol } from "@/types/token";
import { getChainConfig } from "@/utils/chain";
import { Address, TransactionReceipt } from "viem";
import { PublicClient, WalletClient } from "wagmi";

export abstract class BaseBridge {
  protected logo = {
    symbol: "", // File name
    horizontal: "", // File name
  };
  protected name: string = "";
  protected estimateTime = { min: 3, max: 35 }; // In minute

  protected readonly category: BridgeCategory;
  protected contract: BridgeContract | undefined;

  protected readonly sourceChain?: Network;
  protected readonly targetChain?: Network;
  protected readonly sourceToken?: TokenSymbol;
  protected readonly targetToken?: TokenSymbol;

  protected readonly publicClient?: PublicClient;
  protected readonly walletClient?: WalletClient | null;

  constructor(args: {
    category: BridgeCategory;

    sourceChain?: Network;
    targetChain?: Network;
    sourceToken?: TokenSymbol;
    targetToken?: TokenSymbol;

    publicClient?: PublicClient;
    walletClient?: WalletClient | null;
  }) {
    this.category = args.category;

    this.sourceChain = args.sourceChain;
    this.targetChain = args.targetChain;
    this.sourceToken = args.sourceToken;
    this.targetToken = args.targetToken;

    this.publicClient = args.publicClient;
    this.walletClient = args.walletClient;
  }

  async getAllowance(owner: Address) {
    const token = getChainConfig(this.sourceChain)?.tokens.find(({ symbol }) => symbol === this.sourceToken);

    if (this.contract && this.publicClient && token) {
      const abi = (await import("../abi/erc20.json")).default;
      const spender = this.contract.sourceAddress;

      return (await this.publicClient.readContract({
        address: token.address,
        abi,
        functionName: "allowance",
        args: [owner, spender],
      })) as unknown as bigint;
    }

    return 0n;
  }

  async approve(amount: bigint, owner: Address) {
    const token = getChainConfig(this.sourceChain)?.tokens.find(({ symbol }) => symbol === this.sourceToken);

    if (this.contract && this.publicClient && this.walletClient && token) {
      const abi = (await import("../abi/erc20.json")).default;
      const spender = this.contract.sourceAddress;

      const { request } = await this.publicClient.simulateContract({
        address: token.address,
        abi,
        functionName: "approve",
        args: [spender, amount],
        account: owner,
      });
      const hash = await this.walletClient.writeContract(request);
      return await this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  getInfo() {
    return { name: this.name, category: this.category, contract: this.contract, estimateTime: this.estimateTime };
  }

  getLogoSrc(type: BridgeLogoType = "symbol") {
    return `/images/bridge/${type === "horizontal" ? this.logo.horizontal : this.logo.symbol}`;
  }

  formatEstimateTime() {
    return `${this.estimateTime.min}-${this.estimateTime.max} Minutes`;
  }

  getTxGasLimit() {
    return this.sourceChain === "arbitrum" || this.sourceChain === "arbitrum-goerli" ? 1000000n : undefined;
  }

  async getFee(_?: {
    baseFee?: bigint;
    liquidityFeeRate?: bigint;
    transferAmount?: bigint;
  }): Promise<{ value: bigint; token: Token } | undefined> {
    return undefined;
  }

  async getDailyLimit(): Promise<{ limit: bigint; spent: bigint; token: Token } | undefined> {
    return undefined;
  }

  async claim(_record: HistoryRecord): Promise<TransactionReceipt | undefined> {
    return undefined;
  }

  async refund(_record: HistoryRecord): Promise<TransactionReceipt | undefined> {
    return undefined;
  }

  async speedUp(_record: HistoryRecord, _newFee: bigint): Promise<TransactionReceipt | undefined> {
    return undefined;
  }

  abstract transfer(
    sender: string,
    recipient: string,
    amount: bigint,
    options?: Object,
  ): Promise<TransactionReceipt | undefined>;
}
