import { Address, Chain } from "viem";
import { ConstructorOptions, LnBridge, RelayInfo } from "./ln-bridge";
import { HelixProtocolName } from "@helixbridge/helixconf";
import assert from "assert";

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

  async transfer(amount: bigint, recipient: Address, relayer: Address, totalFee: bigint, relayInfo: RelayInfo) {
    void relayInfo;
    assert(this.walletClient, "Wallet client not found");

    const signer = (await this.walletClient.getAddresses())[0];
    const { request } = await this.publicClientSource.simulateContract({
      address: this.sourceBridgeContract,
      abi: (await import("./abi/lnbridge-v3")).default,
      functionName: "lockAndRemoteRelease",
      args: [
        {
          remoteChainId: BigInt(this.targetChain.id),
          provider: relayer,
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
    return this.publicClientSource.waitForTransactionReceipt({ hash, confirmations: 2 });
  }
}
