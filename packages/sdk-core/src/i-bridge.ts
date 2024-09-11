import { Address, Chain, createPublicClient, http, parseUnits, PublicClient, WalletClient } from "viem";
import { Token } from "./token";
import { getErc20Contract } from "@helixbridge/contracts";

export abstract class IBridge {
  protected readonly publicClientOnFromChain: PublicClient;
  protected readonly publicClientOnToChain: PublicClient;
  protected readonly walletClient?: WalletClient;
  protected readonly fromChain: Chain;
  protected readonly fromToken: Token;
  protected readonly toChain: Chain;
  protected readonly toToken: Token;
  protected readonly contractOnFromChain: Address;
  protected readonly contractOnToChain: Address;

  constructor({
    walletClient,
    fromChain,
    fromToken,
    toChain,
    toToken,
    contractOnFromChain,
    contractOnToChain,
  }: {
    walletClient?: WalletClient;
    fromChain: Chain;
    fromToken: Token;
    toChain: Chain;
    toToken: Token;
    contractOnFromChain: Address;
    contractOnToChain: Address;
  }) {
    this.publicClientOnFromChain = createPublicClient({ chain: fromChain, transport: http() });
    this.publicClientOnToChain = createPublicClient({ chain: toChain, transport: http() });
    this.walletClient = walletClient;
    this.fromChain = fromChain;
    this.fromToken = fromToken;
    this.toChain = toChain;
    this.toToken = toToken;
    this.contractOnFromChain = contractOnFromChain;
    this.contractOnToChain = contractOnToChain;
  }

  protected async getSigner() {
    return this.walletClient ? (await this.walletClient.getAddresses()).at(0) : undefined;
  }

  private async getAllowance(owner: Address, spender: Address, token: Token, publicClient: PublicClient) {
    let value = parseUnits(Number.MAX_SAFE_INTEGER.toString(), token.decimals);
    if (!token.isNative) {
      value = await getErc20Contract({ address: token.address, publicClient }).read.allowance([owner, spender]);
    }
    return { value, token };
  }

  async getAllowanceOnFromChain(owner: Address) {
    return this.getAllowance(owner, this.contractOnFromChain, this.fromToken, this.publicClientOnFromChain);
  }

  async getAllowanceOnToChain(owner: Address) {
    return this.getAllowance(owner, this.contractOnToChain, this.toToken, this.publicClientOnToChain);
  }

  private async approve(
    owner: Address,
    spender: Address,
    token: Token,
    amount: bigint,
    chain: Chain,
    publicClient: PublicClient,
  ) {
    if (this.walletClient) {
      const hash = await getErc20Contract({
        address: token.address,
        publicClient,
        walletClient: this.walletClient,
      }).write.approve([spender, amount], { account: owner, chain });
      return publicClient.waitForTransactionReceipt({ hash, confirmations: 2 });
    }
  }

  async approveOnFromChain(amount: bigint, owner: Address) {
    return this.approve(
      owner,
      this.contractOnFromChain,
      this.fromToken,
      amount,
      this.fromChain,
      this.publicClientOnFromChain,
    );
  }

  async approveOnToChain(amount: bigint, owner: Address) {
    return this.approve(
      owner,
      this.contractOnFromChain,
      this.fromToken,
      amount,
      this.fromChain,
      this.publicClientOnFromChain,
    );
  }
}
