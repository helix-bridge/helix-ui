import { Address, encodeFunctionData, encodePacked, Hash, keccak256 } from "viem";
import { ConstructorOptions, LnBridge, RelayInfo } from "./lnbridge";
import { HelixProtocolName } from "@helixbridge/helixconf";
import { assert } from "./utils";
import { DEFAULT_CONFIRMATIONS } from "./config";
import { Chain } from "@helixbridge/chains";

export class LnBridgeV3 extends LnBridge {
  constructor(
    fromChain: Chain,
    toChain: Chain,
    fromToken: Address,
    toToken: Address,
    protocol: HelixProtocolName,
    options?: ConstructorOptions,
  ) {
    super(fromChain, toChain, fromToken, toToken, protocol, options);
  }

  async transfer(amount: bigint, recipient: Address, totalFee: bigint, relayInfo: RelayInfo) {
    assert(this.walletClient, "Wallet client is required");

    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.sourcePublicClient.simulateContract({
      address: this.sourceBridgeContract,
      abi: (await import("./abi/lnbridge-v3")).default,
      functionName: "lockAndRemoteRelease",
      args: [
        {
          remoteChainId: BigInt(this.targetChain.id),
          provider: relayInfo.relayer as Address,
          sourceToken: this.sourceToken.address,
          targetToken: this.targetToken.address,
          totalFee,
          amount,
          receiver: recipient,
          timestamp: BigInt(Math.floor(Date.now() / 1000)),
        },
      ],
      value: this.sourceToken.isNative ? amount + totalFee : undefined,
      gas: this.getGasLimit(),
      account: signer,
    });
    const hash = await this.walletClient.writeContract(request);
    return this.sourcePublicClient.waitForTransactionReceipt({ hash, confirmations: DEFAULT_CONFIRMATIONS });
  }

  async getPenaltyReserves(relayer: Address) {
    const value = await this.sourcePublicClient.readContract({
      address: this.sourceBridgeContract,
      abi: (await import("./abi/lnbridge-v3")).default,
      functionName: "penaltyReserves",
      args: [keccak256(encodePacked(["address", "address"], [this.sourceToken.address, relayer]))],
    });
    return { value, token: this.sourceToken };
  }

  async register(baseFee: bigint, feeRate: number, transferLimit: bigint) {
    assert(this.walletClient, "Wallet client is required");
    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.sourcePublicClient.simulateContract({
      address: this.sourceBridgeContract,
      abi: (await import("./abi/lnbridge-v3")).default,
      functionName: "registerLnProvider",
      args: [
        BigInt(this.targetChain.id),
        this.sourceToken.address,
        this.targetToken.address,
        baseFee,
        feeRate,
        transferLimit,
      ],
      gas: this.getGasLimit(),
      account: signer,
    });
    const hash = await this.walletClient.writeContract(request);
    return this.sourcePublicClient.waitForTransactionReceipt({ hash, confirmations: DEFAULT_CONFIRMATIONS });
  }

  async depositPenaltyReserve(amount: bigint) {
    assert(this.walletClient, "Wallet client is required");
    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.sourcePublicClient.simulateContract({
      address: this.sourceBridgeContract,
      abi: (await import("./abi/lnbridge-v3")).default,
      functionName: "depositPenaltyReserve",
      args: [this.sourceToken.address, amount],
      value: this.sourceToken.isNative ? amount : undefined,
      gas: this.getGasLimit(),
      account: signer,
    });
    const hash = await this.walletClient.writeContract(request);
    return this.sourcePublicClient.waitForTransactionReceipt({ hash, confirmations: DEFAULT_CONFIRMATIONS });
  }

  async withdrawPenaltyReserve(amount: bigint) {
    assert(this.walletClient, "Wallet client is required");
    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.sourcePublicClient.simulateContract({
      address: this.sourceBridgeContract,
      abi: (await import("./abi/lnbridge-v3")).default,
      functionName: "withdrawPenaltyReserve",
      args: [this.sourceToken.address, amount],
      gas: this.getGasLimit(),
      account: signer,
    });
    const hash = await this.walletClient.writeContract(request);
    return this.sourcePublicClient.waitForTransactionReceipt({ hash, confirmations: DEFAULT_CONFIRMATIONS });
  }

  async getLiquidityWithdrawFeeAndParams(
    relayer: Address,
    transferIds: Hash[],
    messageChannel: "layerzero" | "msgline" | "",
  ) {
    const token = this.targetNativeToken;
    let value: bigint | undefined;
    let params: Hash | undefined;

    if (messageChannel === "layerzero") {
      const [sendService] = await this.targetPublicClient.readContract({
        address: this.targetBridgeContract,
        abi: (await import("./abi/lnbridge-v3")).default,
        functionName: "messagers",
        args: [BigInt(this.sourceChain.id)],
      });
      [value] = await this.getLayerZeroFee(sendService, this.sourceChain, this.targetPublicClient);
    } else if (messageChannel === "msgline") {
      const message = encodeFunctionData({
        abi: (await import("./abi/lnbridge-v3")).default,
        functionName: "withdrawLiquidity",
        args: [transferIds, BigInt(this.targetChain.id), relayer],
      });
      const feeAndParams = await this.getMsgportFeeAndParams(
        message,
        relayer,
        this.targetChain,
        this.sourceChain,
        this.targetBridgeContract,
        this.sourceBridgeContract,
        this.targetToken,
        this.sourceToken,
      );
      value = feeAndParams?.fee;
      params = feeAndParams?.params;
    }

    return value ? { value, token, params } : undefined;
  }

  async requestLiquidityWithdraw(relayer: Address, transferIds: Hash[], fee: bigint, params: Hash) {
    assert(this.walletClient, "Wallet client is required");
    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.targetPublicClient.simulateContract({
      address: this.targetBridgeContract,
      abi: (await import("./abi/lnbridge-v3")).default,
      functionName: "requestWithdrawLiquidity",
      args: [BigInt(this.sourceChain.id), transferIds, relayer, params],
      value: fee,
      gas: this.getGasLimit(),
      account: signer,
    });
    const hash = await this.walletClient.writeContract(request);
    return this.targetPublicClient.waitForTransactionReceipt({ hash, confirmations: DEFAULT_CONFIRMATIONS });
  }
}
