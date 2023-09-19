import { BridgeCategory, BridgeContract, BridgeLogoType } from "@/types/bridge";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { getChainConfig } from "@/utils/chain";
import { TransactionReceipt } from "viem";
import { PublicClient, WalletClient } from "wagmi";

export abstract class BaseBridge {
  protected logo = {
    symbol: "", // file name
    horizontal: "", // file name
  };
  protected name: string = "Unknown";

  protected readonly category: BridgeCategory;
  protected readonly contract?: BridgeContract;

  protected readonly sourceChain?: Network;
  protected readonly targetChain?: Network;
  protected readonly sourceToken?: TokenSymbol;
  protected readonly targetToken?: TokenSymbol;

  protected readonly publicClient?: PublicClient;
  protected readonly walletClient?: WalletClient | null;

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
    this.category = args.category;
    this.contract = args.contract;

    this.sourceChain = args.sourceChain;
    this.targetChain = args.targetChain;
    this.sourceToken = args.sourceToken;
    this.targetToken = args.targetToken;

    this.publicClient = args.publicClient;
    this.walletClient = args.walletClient;
  }

  async getAllowance(owner: `0x${string}`) {
    if (this.contract && this.publicClient) {
      const token = getChainConfig(this.sourceChain)?.tokens.find(({ symbol }) => symbol === this.sourceToken);

      if (token) {
        const abi = (await import("../abi/erc20.json")).default;
        const spender = this.contract.sourceAddress;

        return (await this.publicClient.readContract({
          address: token.address,
          abi,
          functionName: "allowance",
          args: [owner, spender],
        })) as unknown as bigint;
      }
    }

    return 0n;
  }

  async approve(amount: bigint) {
    if (this.contract && this.publicClient && this.walletClient) {
      const token = getChainConfig(this.sourceChain)?.tokens.find(({ symbol }) => symbol === this.sourceToken);
      const walletAddress = (await this.walletClient.requestAddresses()).at(0);

      if (token && walletAddress) {
        const abi = (await import("../abi/erc20.json")).default;
        const spender = this.contract.sourceAddress;

        const { request } = await this.publicClient.simulateContract({
          address: token.address,
          abi,
          functionName: "approve",
          args: [spender, amount],
          account: walletAddress,
        });
        const hash = await this.walletClient.writeContract(request);
        return await this.publicClient.waitForTransactionReceipt({ hash });
      }
    }

    return;
  }

  getName() {
    return this.name;
  }

  getLogoSrc(type: BridgeLogoType = "symbol") {
    return `/images/bridge/${type === "horizontal" ? this.logo.horizontal : this.logo.symbol}`;
  }

  getCategory() {
    return this.category;
  }

  getContract() {
    return this.contract;
  }

  getEstimateTime(): string {
    return "";
  }

  async getFee(..._: unknown[]): Promise<bigint | undefined> {
    return undefined;
  }

  abstract transfer(
    sender: string,
    receiver: string,
    amount: bigint,
    options?: Object,
  ): Promise<TransactionReceipt | undefined>;
}
