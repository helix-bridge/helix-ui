import { BridgeConstructorArgs, TransferOptions } from "@/types";
import { LnBridgeBase } from "./lnbridge-base";
import { TransactionReceipt } from "viem";

export class LnBridgeV3 extends LnBridgeBase {
  constructor(args: BridgeConstructorArgs) {
    super(args);
    this.name = "Helix LnBridge(v3)";
    this._initContract();
  }

  private _initContract() {
    if (this.sourceChain?.network === "zksync-goerli") {
      this.contract = {
        sourceAddress: "0xab38D0030cC28e413C4DD2B7D0ac2b6984e6d3f0",
        targetAddress: "0xb0Ce2498C2526cceA1D7792e4B62C3066Eb5529B",
      };
    } else if (this.targetChain?.network === "zksync-goerli") {
      this.contract = {
        sourceAddress: "0xb0Ce2498C2526cceA1D7792e4B62C3066Eb5529B",
        targetAddress: "0xab38D0030cC28e413C4DD2B7D0ac2b6984e6d3f0",
      };
    }
  }

  protected async _transfer(
    _sender: `0x${string}`,
    recipient: `0x${string}`,
    amount: bigint,
    options?: (TransferOptions & { askEstimateGas?: boolean | undefined }) | undefined,
  ): Promise<bigint | TransactionReceipt | undefined> {
    const account = await this.getSigner();
    const provider = options?.relayer;

    if (
      account &&
      provider &&
      this.contract &&
      this.sourcePublicClient &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken
    ) {
      const askEstimateGas = options?.askEstimateGas ?? false;
      const totalFee = options?.totalFee ?? 0n;

      const defaultParams = {
        address: this.contract.sourceAddress,
        abi: (await import("@/abi/lnbridge-v3")).default,
        functionName: "lockAndRemoteRelease",
        args: [
          {
            remoteChainId: BigInt(this.targetChain.id),
            provider,
            sourceToken: this.sourceToken.address,
            targetToken: this.targetToken.address,
            totalFee,
            amount,
            receiver: recipient,
            nonce: options?.withdrawNonce || 0n,
          },
        ],
        value: this.sourceToken.type === "native" ? amount + totalFee : undefined,
        gas: this.getTxGasLimit(),
        account,
      } as const;

      if (askEstimateGas) {
        return this.sourcePublicClient.estimateContractGas(defaultParams);
      } else if (this.walletClient) {
        // TODO: remove
        // try {
        //   const result = await this.sourcePublicClient.simulateContract(defaultParams);
        //   console.log("result:", result);
        // } catch (err) {
        //   console.error("error:", err);
        // }
        const hash = await this.walletClient.writeContract(defaultParams);
        return this.sourcePublicClient.waitForTransactionReceipt({ hash });
      }
    }
  }
}
