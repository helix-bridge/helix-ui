import { BridgeCategory, BridgeContract, BridgeLogo } from "@/types/bridge";
import { ChainConfig, ChainID } from "@/types/chain";
import { CrossChain } from "@/types/cross-chain";
import { HistoryRecord } from "@/types/graphql";
import { Token } from "@/types/token";
import { Address, PublicClient as ViemPublicClient, TransactionReceipt, createPublicClient, http } from "viem";
import { PublicClient as WagmiPublicClient, WalletClient } from "wagmi";

export abstract class BaseBridge {
  protected logo: BridgeLogo = {
    symbol: "",
    horizontal: "",
  };
  protected name: string = "";
  protected estimateTime = { min: 5, max: 20 }; // In minute

  protected readonly category: BridgeCategory;
  protected contract: BridgeContract | undefined;

  protected readonly sourceChain?: ChainConfig;
  protected readonly targetChain?: ChainConfig;
  protected readonly sourceToken?: Token;
  protected readonly targetToken?: Token;
  protected readonly sourceNativeToken?: Token;
  protected readonly targetNativeToken?: Token;
  protected readonly crossInfo?: CrossChain;

  protected readonly sourcePublicClient: ViemPublicClient;
  protected readonly targetPublicClient: ViemPublicClient;
  protected readonly publicClient?: WagmiPublicClient; // The public client to which the wallet is connected
  protected readonly walletClient?: WalletClient | null;

  constructor(args: {
    publicClient?: WagmiPublicClient;
    walletClient?: WalletClient | null;
    category: BridgeCategory;
    logo?: BridgeLogo;

    sourceChain?: ChainConfig;
    targetChain?: ChainConfig;
    sourceToken?: Token;
    targetToken?: Token;
  }) {
    this.category = args.category;
    this.crossInfo = args.sourceChain?.tokens
      .find((t) => t.symbol === args.sourceToken?.symbol)
      ?.cross.find(
        (c) =>
          c.bridge.category === args.category &&
          c.target.network === args.targetChain?.network &&
          c.target.symbol === args.targetToken?.symbol,
      );
    if (args.logo) {
      this.logo = args.logo;
    }

    this.sourceChain = args.sourceChain;
    this.targetChain = args.targetChain;
    this.sourceToken = args.sourceToken;
    this.targetToken = args.targetToken;
    this.sourceNativeToken = args.sourceChain?.tokens.find(({ type }) => type === "native");
    this.targetNativeToken = args.targetChain?.tokens.find(({ type }) => type === "native");

    this.walletClient = args.walletClient;
    this.publicClient = args.publicClient;
    this.sourcePublicClient = createPublicClient({ chain: args.sourceChain, transport: http() });
    this.targetPublicClient = createPublicClient({ chain: args.targetChain, transport: http() });
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

  getEstimateTime() {
    return this.estimateTime;
  }

  formatEstimateTime() {
    return `${this.estimateTime.min}-${this.estimateTime.max} Minutes`;
  }

  getTxGasLimit() {
    return this.sourceChain?.id === ChainID.ARBITRUM || this.sourceChain?.id === ChainID.ARBITRUM_GOERLI
      ? 1000000n
      : undefined;
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

  private async getBalance(address: Address, token: Token, publicClient: ViemPublicClient) {
    let value = 0n;

    if (token.type === "native") {
      value = await publicClient.getBalance({ address });
    } else {
      const abi = (await import("../abi/erc20.json")).default;
      value = (await publicClient.readContract({
        address: token.address,
        abi,
        functionName: "balanceOf",
        args: [address],
      })) as unknown as bigint;
    }

    return { value, token };
  }

  async getSourceBalance(address: Address) {
    if (this.sourceToken) {
      return this.getBalance(address, this.sourceToken, this.sourcePublicClient);
    }
  }

  async getTargetBalance(address: Address) {
    if (this.targetToken) {
      return this.getBalance(address, this.targetToken, this.targetPublicClient);
    }
  }

  private async getAllowance(owner: Address, spender: Address, token: Token, publicClient: ViemPublicClient) {
    const abi = (await import("../abi/erc20.json")).default;
    const value = (await publicClient.readContract({
      address: token.address,
      abi,
      functionName: "allowance",
      args: [owner, spender],
    })) as unknown as bigint;
    return { value, token };
  }

  async getSourceAllowance(owner: Address) {
    if (this.contract && this.sourceToken) {
      return await this.getAllowance(owner, this.contract.sourceAddress, this.sourceToken, this.sourcePublicClient);
    }
  }

  async getTargetAllowance(owner: Address) {
    if (this.contract && this.targetToken) {
      return await this.getAllowance(owner, this.contract.targetAddress, this.targetToken, this.targetPublicClient);
    }
  }

  private async approve(amount: bigint, owner: Address, spender: Address, token: Token) {
    if (this.publicClient && this.walletClient) {
      const abi = (await import("../abi/erc20.json")).default;
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

  async sourceApprove(amount: bigint, owner: Address) {
    if (this.sourceChain?.id !== (await this.publicClient?.getChainId())) {
      throw new Error("Wrong network");
    }
    if (this.sourceToken && this.contract) {
      return this.approve(amount, owner, this.contract.sourceAddress, this.sourceToken);
    }
  }

  async targetApprove(amount: bigint, owner: Address) {
    if (this.targetChain?.id !== (await this.publicClient?.getChainId())) {
      throw new Error("Wrong network");
    }
    if (this.targetToken && this.contract) {
      return this.approve(amount, owner, this.contract.targetAddress, this.targetToken);
    }
  }

  abstract transfer(
    sender: string,
    recipient: string,
    amount: bigint,
    options?: Object,
  ): Promise<TransactionReceipt | undefined>;
}
