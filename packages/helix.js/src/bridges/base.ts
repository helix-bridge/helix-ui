import type { BridgeCategory, Network, TokenSymbol } from "../types";
import { PublicClient, TransactionReceipt, WalletClient } from "viem";
import { getChainConfig } from "../utils";

export abstract class BaseBridge {
  protected readonly category: BridgeCategory;

  protected readonly sourceChain: Network;
  protected readonly targetChain: Network;
  protected readonly sourceToken: TokenSymbol;
  protected readonly targetToken: TokenSymbol;

  protected readonly publicClient: PublicClient;
  protected readonly walletClient: WalletClient;

  constructor(args: {
    category: BridgeCategory;
    sourceChain: Network;
    targetChain: Network;
    sourceToken: TokenSymbol;
    targetToken: TokenSymbol;
    publicClient: PublicClient;
    walletClient: WalletClient;
  }) {
    this.category = args.category;

    this.sourceChain = args.sourceChain;
    this.targetChain = args.targetChain;
    this.sourceToken = args.sourceToken;
    this.targetToken = args.targetToken;

    this.publicClient = args.publicClient;
    this.walletClient = args.walletClient;
  }

  getCategory() {
    return this.category;
  }

  getEstimateTime(): string | undefined {
    return undefined;
  }

  async getFee(..._: unknown[]): Promise<bigint | undefined> {
    return undefined;
  }

  async getAllowance(owner: `0x${string}`) {
    const { crossChain, tokens } = getChainConfig(this.sourceChain);
    const bridgeContract = crossChain[this.targetChain]?.[this.category]?.bridgeContract;
    const tokenAddress = tokens.find(({ symbol }) => symbol === this.sourceToken)?.address;

    if (bridgeContract && tokenAddress) {
      const abi = (await import("../abi/erc20.json")).default;
      const spender = bridgeContract.sourceAddress;

      return (await this.publicClient.readContract({
        address: tokenAddress,
        abi,
        functionName: "allowance",
        args: [owner, spender],
      })) as unknown as bigint;
    }

    return 0n;
  }

  async approve(amount: bigint) {
    const { crossChain, tokens } = getChainConfig(this.sourceChain);
    const bridgeContract = crossChain[this.targetChain]?.[this.category]?.bridgeContract;
    const tokenAddress = tokens.find(({ symbol }) => symbol === this.sourceToken)?.address;
    const walletAddress = (await this.walletClient.requestAddresses()).at(0);

    if (bridgeContract && tokenAddress && walletAddress) {
      const abi = (await import("../abi/erc20.json")).default;
      const spender = bridgeContract.sourceAddress;

      const { request } = await this.publicClient.simulateContract({
        address: tokenAddress,
        abi,
        functionName: "approve",
        args: [spender, amount],
        account: walletAddress,
      });
      const hash = await this.walletClient.writeContract(request);
      return await this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async transfer(
    sender: string,
    receiver: string,
    amount: bigint,
    options?: Object,
  ): Promise<TransactionReceipt | undefined> {
    void sender, receiver, amount, options;
    return;
  }

  abstract getName(): string;
}
