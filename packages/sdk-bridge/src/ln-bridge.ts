import { Address, Chain, createPublicClient, http, PublicClient, WalletClient } from "viem";
import { HelixChain, HelixProtocolName } from "@helixbridge/helixconf";
import assert from "assert";
import { getChainByIdOrNetwork, Chain as HChain } from "@helixbridge/chains";
import { OnChainToken, Token } from "@helixbridge/sdk-core";

interface Options {
  walletClient?: WalletClient;
}

export abstract class LnBridge {
  private readonly sourceToken: Token;
  private readonly targetToken: Token;
  private readonly sourceChain: HChain;
  private readonly targetChain: HChain;
  private readonly walletClient?: WalletClient;
  private readonly publicClientSource: PublicClient;
  private readonly publicClientTarget: PublicClient;
  private readonly sourceBridgeContract: Address;
  private readonly targetBridgeContract: Address;

  constructor(
    fromChain: Chain,
    toChain: Chain,
    fromToken: Address,
    toToken: Address,
    protocol: HelixProtocolName,
    options?: Options,
  ) {
    const sourceChain = getChainByIdOrNetwork(fromChain.id);
    assert(sourceChain, "Source chain not found");
    const targetChain = getChainByIdOrNetwork(toChain.id);
    assert(targetChain, "Target chain not found");

    const sourceChainConf = HelixChain.get(fromChain.id);
    assert(sourceChainConf, "Source chain conf not found");
    const targetChainConf = HelixChain.get(toChain.id);
    assert(targetChainConf, "Target chain conf not found");

    const sourceTokenConf = sourceChainConf.tokens.find((t) => t.address.toLowerCase() === fromToken.toLowerCase());
    assert(sourceTokenConf, "Source token conf not found");
    const targetTokenConf = targetChainConf.tokens.find((t) => t.address.toLowerCase() === toToken.toLowerCase());
    assert(targetTokenConf, "Target token conf not found");

    const couple = sourceChainConf.couples.find(
      (c) =>
        c.chain.id === targetChainConf.id &&
        c.symbol.from === sourceTokenConf.symbol &&
        c.symbol.to === targetTokenConf.symbol &&
        c.protocol.name === protocol,
    );
    assert(couple, "Couple not found");

    const bridgeContractSource = sourceChainConf.protocol[couple.protocol.name] as Address | undefined;
    assert(bridgeContractSource, "Source bridge contract not found");
    this.sourceBridgeContract = bridgeContractSource;
    this.targetBridgeContract = couple.protocol.address as Address;

    this.sourceToken = new Token(
      sourceChain.id,
      sourceTokenConf.address as Address,
      sourceTokenConf.decimals,
      sourceTokenConf.symbol,
      sourceTokenConf.name,
      sourceTokenConf.logo,
    );
    this.targetToken = new Token(
      targetChain.id,
      targetTokenConf.address as Address,
      targetTokenConf.decimals,
      targetTokenConf.symbol,
      targetTokenConf.name,
      targetTokenConf.logo,
    );
    this.sourceChain = sourceChain;
    this.targetChain = targetChain;
    this.walletClient = options?.walletClient;
    this.publicClientSource = createPublicClient({ chain: sourceChain, transport: http() });
    this.publicClientTarget = createPublicClient({ chain: targetChain, transport: http() });
  }

  private async getTokenAllowance(owner: Address, spender: Address, token: Token, publicClient: PublicClient) {
    const onChainToken = new OnChainToken(token.chainId, token.address, token.decimals, token.symbol, token.name, {
      publicClient,
    });
    return onChainToken.getAllowance(owner, spender);
  }

  async getSourceTokenAllowance(owner: Address) {
    return this.getTokenAllowance(owner, this.sourceBridgeContract, this.sourceToken, this.publicClientSource);
  }

  async getTargetTokenAllowance(owner: Address) {
    return this.getTokenAllowance(owner, this.targetBridgeContract, this.targetToken, this.publicClientTarget);
  }

  private async approveToken(
    spender: Address,
    amount: bigint,
    token: Token,
    publicClient: PublicClient,
    walletClient?: WalletClient,
  ) {
    const onChainToken = new OnChainToken(token.chainId, token.address, token.decimals, token.symbol, token.name, {
      publicClient,
      walletClient,
    });
    return onChainToken.approve(spender, amount);
  }

  async approveSourceToken(amount: bigint) {
    return this.approveToken(
      this.sourceBridgeContract,
      amount,
      this.sourceToken,
      this.publicClientSource,
      this.walletClient,
    );
  }

  async approveTargetToken(amount: bigint) {
    return this.approveToken(
      this.targetBridgeContract,
      amount,
      this.targetToken,
      this.publicClientTarget,
      this.walletClient,
    );
  }

  // eslint-disable-next-line no-unused-vars
  abstract transfer(amount: bigint, recipient: Address): Promise<string>;
}
