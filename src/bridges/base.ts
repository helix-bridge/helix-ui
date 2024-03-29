import {
  BridgeCategory,
  BridgeConstructorArgs,
  BridgeContract,
  BridgeLogo,
  ChainConfig,
  CrossChain,
  GetFeeArgs,
  HistoryRecord,
  Location,
  Token,
  TransferOptions,
} from "@/types";
import { getBalance } from "@/utils";
import { Address, PublicClient as ViemPublicClient, TransactionReceipt, createPublicClient, http } from "viem";
import { PublicClient as WagmiPublicClient, WalletClient } from "wagmi";

export abstract class BaseBridge {
  protected logo: BridgeLogo = { symbol: "", horizontal: "" };
  protected name: string = "";
  protected estimateTime = { min: 5, max: 20 }; // In minute

  protected readonly category: BridgeCategory;
  protected contract: BridgeContract | undefined;
  protected convertor: { source?: Address; target?: Address } | undefined;

  protected readonly sourceChain?: ChainConfig;
  protected readonly targetChain?: ChainConfig;
  protected readonly sourceToken?: Token;
  protected readonly targetToken?: Token;
  protected readonly sourceNativeToken?: Token;
  protected readonly targetNativeToken?: Token;
  protected readonly crossInfo?: CrossChain;

  protected readonly sourcePublicClient: ViemPublicClient | undefined;
  protected readonly targetPublicClient: ViemPublicClient | undefined;
  protected readonly publicClient?: WagmiPublicClient; // The public client to which the wallet is connected
  protected readonly walletClient?: WalletClient | null;

  constructor(args: BridgeConstructorArgs) {
    this.category = args.category;
    this.crossInfo = args.sourceChain?.tokens
      .find((t) => t.symbol === args.sourceToken?.symbol)
      ?.cross.find(
        (c) =>
          c.bridge.category === args.category &&
          c.target.network === args.targetChain?.network &&
          c.target.symbol === args.targetToken?.symbol,
      );

    this.sourceChain = args.sourceChain;
    this.targetChain = args.targetChain;
    this.sourceToken = args.sourceToken;
    this.targetToken = args.targetToken;
    this.sourceNativeToken = args.sourceChain?.tokens.find(({ type }) => type === "native");
    this.targetNativeToken = args.targetChain?.tokens.find(({ type }) => type === "native");

    this.walletClient = args.walletClient;
    this.publicClient = args.publicClient;
    if (args.sourceChain && args.targetChain) {
      this.sourcePublicClient = createPublicClient({ chain: args.sourceChain, transport: http() });
      this.targetPublicClient = createPublicClient({ chain: args.targetChain, transport: http() });
    }
  }

  protected initContractByBackingIssuing(backing: Address, issuing: Address) {
    if (this.crossInfo?.action === "issue") {
      this.contract = { sourceAddress: backing, targetAddress: issuing };
    } else if (this.crossInfo?.action === "redeem") {
      this.contract = { sourceAddress: issuing, targetAddress: backing };
    }
  }

  protected async getSigner() {
    if (this.walletClient) {
      return (await this.walletClient.getAddresses()).at(0);
    }
  }

  protected async validateNetwork(location: Location) {
    const chain = location === "source" ? this.sourceChain : this.targetChain;
    if (chain?.id !== (await this.publicClient?.getChainId())) {
      throw new Error("Wrong network");
    }
  }

  protected abstract _transfer(
    sender: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { askEstimateGas?: boolean },
  ): Promise<TransactionReceipt | bigint | undefined>;

  getLogo() {
    return this.logo;
  }

  getName() {
    return this.name;
  }

  getContract() {
    return this.contract;
  }

  getSourceToken() {
    return this.sourceToken;
  }

  getTargetToken() {
    return this.targetToken;
  }

  getSourceChain() {
    return this.sourceChain;
  }

  getTargetChain() {
    return this.targetChain;
  }

  getCrossInfo() {
    return this.crossInfo;
  }

  getEstimateTime() {
    return this.estimateTime;
  }

  formatEstimateTime() {
    return `${this.estimateTime.min}~${this.estimateTime.max} Minutes`;
  }

  getTxGasLimit() {
    return this.sourceChain?.network === "arbitrum" || this.sourceChain?.network === "arbitrum-sepolia"
      ? 3000000n
      : undefined;
  }

  async getFee(_?: GetFeeArgs): Promise<{ value: bigint; token: Token } | undefined> {
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

  async getSourceBalance(address: Address) {
    if (this.sourceToken && this.sourcePublicClient) {
      return getBalance(address, this.sourceToken, this.sourcePublicClient);
    }
  }

  async getTargetBalance(address: Address) {
    if (this.targetToken && this.targetPublicClient) {
      return getBalance(address, this.targetToken, this.targetPublicClient);
    }
  }

  private async getAllowance(owner: Address, spender: Address, token: Token, publicClient: ViemPublicClient) {
    if (token.type === "erc20") {
      const value = await publicClient.readContract({
        address: token.address,
        abi: (await import("@/abi/erc20")).default,
        functionName: "allowance",
        args: [owner, spender],
      });
      return { value, token };
    }
  }

  async getSourceAllowance(owner: Address) {
    if (this.contract && this.sourceToken && this.sourcePublicClient) {
      const spender = this.convertor?.source ?? this.contract.sourceAddress;
      return this.getAllowance(owner, spender, this.sourceToken, this.sourcePublicClient);
    }
  }

  async getTargetAllowance(owner: Address) {
    if (this.contract && this.targetToken && this.targetPublicClient) {
      const spender = this.convertor?.target ?? this.contract.targetAddress;
      return this.getAllowance(owner, spender, this.targetToken, this.targetPublicClient);
    }
  }

  private async approve(amount: bigint, owner: Address, spender: Address, token: Token) {
    if (this.publicClient && this.walletClient) {
      const { request } = await this.publicClient.simulateContract({
        address: token.address,
        abi: (await import("@/abi/erc20")).default,
        functionName: "approve",
        args: [spender, amount],
        account: owner,
      });
      const hash = await this.walletClient.writeContract(request);
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async sourceApprove(amount: bigint, owner: Address) {
    await this.validateNetwork("source");
    if (this.sourceToken && this.contract) {
      const spender = this.convertor?.source ?? this.contract.sourceAddress;
      return this.approve(amount, owner, spender, this.sourceToken);
    }
  }

  async targetApprove(amount: bigint, owner: Address) {
    await this.validateNetwork("target");
    if (this.targetToken && this.contract) {
      const spender = this.convertor?.target ?? this.contract.targetAddress;
      return this.approve(amount, owner, spender, this.targetToken);
    }
  }

  async transfer(sender: Address, recipient: Address, amount: bigint, options?: TransferOptions) {
    await this.validateNetwork("source");
    return this._transfer(sender, recipient, amount, options) as Promise<TransactionReceipt | undefined>;
  }

  async estimateTransferGas(sender: Address, recipient: Address, amount: bigint, options?: TransferOptions) {
    return this._transfer(sender, recipient, amount, { ...options, askEstimateGas: true }) as Promise<
      bigint | undefined
    >;
  }

  async estimateTransferGasFee(sender: Address, recipient: Address, amount: bigint, options?: TransferOptions) {
    const estimateGas = await this.estimateTransferGas(sender, recipient, amount, options);
    if (estimateGas && this.sourcePublicClient) {
      const { maxFeePerGas } = await this.sourcePublicClient.estimateFeesPerGas();
      return maxFeePerGas ? maxFeePerGas * estimateGas : undefined;
    }
  }
}
