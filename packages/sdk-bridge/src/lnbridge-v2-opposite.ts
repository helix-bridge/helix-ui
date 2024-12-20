import { Address, Hash } from "viem";
import { ConstructorOptions, RelayInfo } from "./lnbridge";
import { HelixProtocolName } from "@helixbridge/helixconf";
import { DEFAULT_CONFIRMATIONS } from "./config";
import { LnBridgeV2 } from "./lnbridge-v2";
import { assert } from "./utils";
import { Chain } from "@helixbridge/chains";

export class LnBridgeV2Opposite extends LnBridgeV2 {
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
    assert(relayInfo.margin, "Deposited margin not found");

    const snapshot = {
      remoteChainId: BigInt(this.targetChain.id),
      provider: relayInfo.relayer as Address,
      sourceToken: this.sourceToken.address,
      targetToken: this.targetToken.address,
      transferId: relayInfo.lastTransferId as Hash,
      totalFee,
      depositedMargin: BigInt(relayInfo.margin),
    } as const;

    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.sourcePublicClient.simulateContract({
      address: this.sourceBridgeContract,
      abi: (await import(`./abi/lnv2-opposite`)).default,
      functionName: "transferAndLockMargin",
      args: [snapshot, amount, recipient],
      value: this.sourceToken.isNative ? amount + totalFee : undefined,
      gas: this.getGasLimit(),
      account: signer,
    });
    const hash = await this.walletClient.writeContract(request);
    return this.sourcePublicClient.waitForTransactionReceipt({ hash, confirmations: DEFAULT_CONFIRMATIONS });
  }

  /**
   * Update fee rate and margin
   * @param baseFee - Base fee in source token
   * @param feeRate - Fee rate in percentage (0-100)
   * @param margin - Margin in source token
   * @returns TransactionReceipt
   */
  async updateFeeRateMargin(baseFee: bigint, feeRate: number, margin: bigint) {
    assert(this.walletClient, "Wallet client is required");
    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.sourcePublicClient.simulateContract({
      address: this.sourceBridgeContract,
      abi: (await import(`./abi/lnv2-opposite`)).default,
      functionName: "updateProviderFeeAndMargin",
      args: [BigInt(this.targetChain.id), this.sourceToken.address, this.targetToken.address, margin, baseFee, feeRate],
      value: this.sourceToken.isNative ? margin : undefined,
      gas: this.getGasLimit(),
      account: signer,
    });
    const hash = await this.walletClient.writeContract(request);
    return this.sourcePublicClient.waitForTransactionReceipt({ hash, confirmations: DEFAULT_CONFIRMATIONS });
  }
}
