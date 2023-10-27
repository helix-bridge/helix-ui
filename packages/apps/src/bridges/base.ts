import { BridgeCategory, BridgeContract, BridgeLogo, TransferOptions } from "@/types/bridge";
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

  protected readonly sourcePublicClient: ViemPublicClient | undefined;
  protected readonly targetPublicClient: ViemPublicClient | undefined;
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

  protected initContractFromBackingIssuing(backing: Address, issuing: Address) {
    if (this.crossInfo?.action === "issue") {
      this.contract = { sourceAddress: backing, targetAddress: issuing };
    } else if (this.crossInfo?.action === "redeem") {
      this.contract = { sourceAddress: issuing, targetAddress: backing };
    }
  }

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

  protected async validateNetwork(position: "source" | "target") {
    const chain = position === "source" ? this.sourceChain : this.targetChain;
    if (chain?.id !== (await this.publicClient?.getChainId())) {
      throw new Error("Wrong network");
    }
  }

  async getFee(_?: {
    baseFee?: bigint;
    protocolFee?: bigint;
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
    if (this.sourceToken && this.sourcePublicClient) {
      return this.getBalance(address, this.sourceToken, this.sourcePublicClient);
    }
  }

  async getTargetBalance(address: Address) {
    if (this.targetToken && this.targetPublicClient) {
      return this.getBalance(address, this.targetToken, this.targetPublicClient);
    }
  }

  private async getAllowance(owner: Address, spender: Address, token: Token, publicClient: ViemPublicClient) {
    if (token.type === "erc20") {
      const abi = (await import("../abi/erc20.json")).default;
      const value = (await publicClient.readContract({
        address: token.address,
        abi,
        functionName: "allowance",
        args: [owner, spender],
      })) as unknown as bigint;
      return { value, token };
    }
  }

  async getSourceAllowance(owner: Address) {
    if (this.contract && this.sourceToken && this.sourcePublicClient) {
      return await this.getAllowance(owner, this.contract.sourceAddress, this.sourceToken, this.sourcePublicClient);
    }
  }

  async getTargetAllowance(owner: Address) {
    if (this.contract && this.targetToken && this.targetPublicClient) {
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

  abstract transfer(
    sender: string,
    recipient: string,
    amount: bigint,
    options?: Partial<TransferOptions>,
  ): Promise<TransactionReceipt | undefined>;
}
