import { HelixChain } from "@helixbridge/helixconf";
import {
  BridgeCategory,
  BridgeConstructorArgs,
  BridgeContract,
  BridgeLogo,
  ChainConfig,
  CrossChain,
  GetFeeArgs,
  Location,
  Token,
  TransferOptions,
} from "../types";
import { getBalance } from "../utils";
import { Address, PublicClient as ViemPublicClient, TransactionReceipt, createPublicClient, http } from "viem";
import { PublicClient as WagmiPublicClient, WalletClient } from "wagmi";
import { CONFIRMATION_BLOCKS } from "../config";

export abstract class BaseBridge {
  protected logo: BridgeLogo = { symbol: "", horizontal: "" };
  protected name: string = "";
  protected estimateTime = { min: 5, max: 20 }; // In minute

  protected readonly category: BridgeCategory;
  protected readonly protocol: BridgeCategory;
  protected contract: BridgeContract | undefined;

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
    this.protocol = args.protocol;
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

    const fromChain = HelixChain.chains().find((c) => c.code === args.sourceChain?.network);
    const couple = fromChain?.couples.find(
      (c) =>
        c.chain.code === args.targetChain?.network &&
        c.symbol.from === args.sourceToken?.symbol &&
        c.symbol.to === args.targetToken?.symbol &&
        c.protocol.name === args.protocol,
    );
    const sourceAddress =
      fromChain?.protocol && couple?.protocol
        ? (fromChain.protocol[couple.protocol.name] as Address | undefined)
        : undefined;
    const targetAddress = couple?.protocol.address as Address | undefined;
    if (sourceAddress && targetAddress) {
      this.contract = { sourceAddress, targetAddress };
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

  isLnBridge() {
    return false;
  }

  getLogo() {
    return this.logo;
  }

  getName() {
    return this.name;
  }

  getCategory() {
    return this.category;
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
    void _;
    return undefined;
  }

  async getDailyLimit(): Promise<{ limit: bigint; spent: bigint; token: Token } | undefined> {
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
        abi: (await import("../abi/erc20")).default,
        functionName: "allowance",
        args: [owner, spender],
      });
      return { value, token };
    }
  }

  async getSourceAllowance(owner: Address) {
    if (this.contract && this.sourceToken && this.sourcePublicClient) {
      return this.getAllowance(owner, this.contract.sourceAddress, this.sourceToken, this.sourcePublicClient);
    }
  }

  async getTargetAllowance(owner: Address) {
    if (this.contract && this.targetToken && this.targetPublicClient) {
      return this.getAllowance(owner, this.contract.targetAddress, this.targetToken, this.targetPublicClient);
    }
  }

  private async approve(amount: bigint, owner: Address, spender: Address, token: Token) {
    if (this.publicClient && this.walletClient) {
      const { request } = await this.publicClient.simulateContract({
        address: token.address,
        abi: (await import("../abi/erc20")).default,
        functionName: "approve",
        args: [spender, amount],
        account: owner,
      });
      const hash = await this.walletClient.writeContract(request);
      return this.publicClient.waitForTransactionReceipt({ hash, confirmations: CONFIRMATION_BLOCKS });
    }
  }

  async sourceApprove(amount: bigint, owner: Address) {
    await this.validateNetwork("source");
    if (this.sourceToken && this.contract) {
      return this.approve(amount, owner, this.contract.sourceAddress, this.sourceToken);
    }
  }

  async targetApprove(amount: bigint, owner: Address) {
    await this.validateNetwork("target");
    if (this.targetToken && this.contract) {
      return this.approve(amount, owner, this.contract.targetAddress, this.targetToken);
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
