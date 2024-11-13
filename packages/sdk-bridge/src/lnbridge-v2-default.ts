import { Address, Hash } from "viem";
import { Chain } from "viem";
import { ConstructorOptions, LnBridge, RelayInfo } from "./ln-bridge";
import { HelixProtocolName } from "@helixbridge/helixconf";
import assert from "assert";

export class LnBridgeV2Default extends LnBridge {
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
    assert(this.walletClient, "Wallet client not found");
    assert(relayInfo.lastTransferId, "Transfer ID not found");

    const snapshot = {
      remoteChainId: BigInt(this.targetChain.id),
      provider: relayInfo.relayer as Address,
      sourceToken: this.sourceToken.address,
      targetToken: this.targetToken.address,
      transferId: relayInfo.lastTransferId as Hash,
      totalFee,
      withdrawNonce: relayInfo.withdrawNonce,
    } as const;

    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.publicClientSource.simulateContract({
      address: this.sourceBridgeContract,
      abi: (await import(`./abi/lnv2-default`)).default,
      functionName: "transferAndLockMargin",
      args: [snapshot, amount, recipient],
      value: this.sourceToken.isNative ? amount + totalFee : undefined,
      gas: this.getGasLimit(),
      account: signer,
    });
    const hash = await this.walletClient.writeContract(request);
    return this.publicClientSource.waitForTransactionReceipt({ hash, confirmations: 2 });
  }
}
