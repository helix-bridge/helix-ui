import {
  Address,
  bytesToHex,
  Chain,
  createPublicClient,
  encodeFunctionData,
  Hash,
  http,
  PublicClient,
  TransactionReceipt,
  WalletClient,
  zeroAddress,
} from "viem";
import { HelixChain, HelixProtocolName } from "@helixbridge/helixconf";
import { getChainByIdOrNetwork, Chain as HChain } from "@helixbridge/chains";
import { OnChainToken, Token } from "@helixbridge/sdk-core";
import { fetchMsgportFeeAndParams, assert } from "./utils";
import { SortedSolveInfo } from "@helixbridge/sdk-indexer";

export interface ConstructorOptions {
  walletClient?: WalletClient;
}
export type SolveInfo = NonNullable<NonNullable<NonNullable<SortedSolveInfo>["records"]>[number]>;

export abstract class LnBridge {
  private readonly protocol: HelixProtocolName;
  protected readonly sourceToken: Token;
  protected readonly targetToken: Token;
  protected readonly sourceNativeToken: Token;
  protected readonly targetNativeToken: Token;
  protected readonly sourceChain: HChain;
  protected readonly targetChain: HChain;
  protected readonly walletClient?: WalletClient;
  protected readonly sourcePublicClient: PublicClient;
  protected readonly targetPublicClient: PublicClient;
  protected readonly sourceBridgeContract: Address;
  protected readonly targetBridgeContract: Address;

  constructor(
    fromChain: Chain,
    toChain: Chain,
    fromToken: Address,
    toToken: Address,
    protocol: HelixProtocolName,
    options?: ConstructorOptions,
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
        Number(c.chain.id) === Number(targetChainConf.id) &&
        c.symbol.from === sourceTokenConf.symbol &&
        c.symbol.to === targetTokenConf.symbol &&
        c.protocol.name === protocol,
    );
    assert(couple, "Couple not found");

    const sourceBridgeContract = sourceChainConf.protocol[couple.protocol.name] as Address | undefined;
    assert(sourceBridgeContract, "Source bridge contract not found");
    this.sourceBridgeContract = sourceBridgeContract;
    this.targetBridgeContract = couple.protocol.address as Address;

    const sourceNativeTokenConf = sourceChainConf.tokens.find((t) => t.type === "native");
    const targetNativeTokenConf = targetChainConf.tokens.find((t) => t.type === "native");
    this.sourceNativeToken = sourceNativeTokenConf
      ? new Token(
          sourceChain.id,
          sourceNativeTokenConf.address as Address,
          sourceNativeTokenConf.decimals,
          sourceNativeTokenConf.symbol,
          sourceNativeTokenConf.name,
          sourceNativeTokenConf.logo,
        )
      : new Token(
          sourceChain.id,
          zeroAddress,
          sourceChain.nativeCurrency.decimals,
          sourceChain.nativeCurrency.symbol,
          sourceChain.nativeCurrency.name,
        );
    this.targetNativeToken = targetNativeTokenConf
      ? new Token(
          targetChain.id,
          targetNativeTokenConf.address as Address,
          targetNativeTokenConf.decimals,
          targetNativeTokenConf.symbol,
          targetNativeTokenConf.name,
          targetNativeTokenConf.logo,
        )
      : new Token(
          targetChain.id,
          zeroAddress,
          targetChain.nativeCurrency.decimals,
          targetChain.nativeCurrency.symbol,
          targetChain.nativeCurrency.name,
        );

    this.protocol = protocol;
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
    this.sourcePublicClient = createPublicClient({ chain: sourceChain, transport: http() });
    this.targetPublicClient = createPublicClient({ chain: targetChain, transport: http() });
  }

  async getSourceTokenBalance(address: Address) {
    const onChainToken = new OnChainToken(
      this.sourceChain.id,
      this.sourceToken.address,
      this.sourceToken.decimals,
      this.sourceToken.symbol,
      this.sourceToken.name,
      {
        publicClient: this.sourcePublicClient,
      },
    );
    const value = await onChainToken.getBalance(address);
    return { value, token: this.sourceToken };
  }

  async getTargetTokenBalance(address: Address) {
    const onChainToken = new OnChainToken(
      this.targetChain.id,
      this.targetToken.address,
      this.targetToken.decimals,
      this.targetToken.symbol,
      this.targetToken.name,
      {
        publicClient: this.targetPublicClient,
      },
    );
    const value = await onChainToken.getBalance(address);
    return { value, token: this.targetToken };
  }

  private async getTokenAllowance(owner: Address, spender: Address, token: Token, publicClient: PublicClient) {
    const onChainToken = new OnChainToken(token.chainId, token.address, token.decimals, token.symbol, token.name, {
      publicClient,
    });
    return onChainToken.getAllowance(owner, spender);
  }

  async getSourceTokenAllowance(owner: Address) {
    const value = await this.getTokenAllowance(
      owner,
      this.sourceBridgeContract,
      this.sourceToken,
      this.sourcePublicClient,
    );
    return { value, token: this.sourceToken };
  }

  async getTargetTokenAllowance(owner: Address) {
    const value = await this.getTokenAllowance(
      owner,
      this.targetBridgeContract,
      this.targetToken,
      this.targetPublicClient,
    );
    return { value, token: this.targetToken };
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
      this.sourcePublicClient,
      this.walletClient,
    );
  }

  async approveTargetToken(amount: bigint) {
    return this.approveToken(
      this.targetBridgeContract,
      amount,
      this.targetToken,
      this.targetPublicClient,
      this.walletClient,
    );
  }

  async getTotalFee(relayer: Address, amount: bigint) {
    const value = await this.sourcePublicClient.readContract({
      address: this.sourceBridgeContract,
      abi: (await import(`./abi/lnv2-default`)).default,
      functionName: "totalFee",
      args: [BigInt(this.targetChain.id), relayer, this.sourceToken.address, this.targetToken.address, amount],
    });
    return { value, token: this.sourceToken };
  }

  protected async getLayerZeroFee(sendService: Address, remoteChain: Chain, localPublicClient: PublicClient) {
    const [nativeFee, zroFee] = await localPublicClient.readContract({
      address: sendService,
      abi: (await import(`./abi/lnaccess-controller`)).default,
      functionName: "fee",
      args: [BigInt(remoteChain.id), bytesToHex(Uint8Array.from([123]), { size: 750 })],
    });
    return [nativeFee, zroFee];
  }

  protected async getMsgportFeeAndParams(
    message: Hash,
    refundAddress: Address,
    localChain: Chain,
    remoteChain: Chain,
    localContract: Address,
    remoteContract: Address,
    localToken: Token,
    remoteToken: Token,
  ) {
    const localMessager = HelixChain.get(localChain.id)?.messager("msgline")?.address as Address | undefined;
    const rm = HelixChain.get(localChain.id)?.couples.find(
      (c) =>
        c.chain.id === BigInt(remoteChain.id) &&
        c.symbol.from === localToken.symbol &&
        c.symbol.to === remoteToken.symbol &&
        c.protocol.name === this.protocol,
    )?.messager;
    const remoteMessager = rm?.name === "msgline" ? (rm.address as Address | undefined) : undefined;

    if (localMessager && remoteMessager) {
      const payload = encodeFunctionData({
        abi: (await import("./abi/msgline-messager")).default,
        functionName: "receiveMessage",
        args: [BigInt(localChain.id), localContract, remoteContract, message],
      });

      return fetchMsgportFeeAndParams(
        localChain.id,
        remoteChain.id,
        localMessager,
        remoteMessager,
        refundAddress,
        payload,
      );
    }
  }

  protected getGasLimit() {
    return this.sourceChain?.network === "arbitrum" || this.sourceChain?.network === "arbitrum-sepolia"
      ? 3000000n
      : undefined;
  }

  /* eslint-disable no-unused-vars */
  abstract transfer(
    amount: bigint,
    recipient: Address,
    totalFee: bigint,
    solveInfo: SolveInfo,
  ): Promise<TransactionReceipt>;
  /* eslint-enable no-unused-vars */
}
