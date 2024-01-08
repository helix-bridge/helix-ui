import { Address, TransactionReceipt } from "viem";
import { LnBridgeBase } from "./lnbridge-base";
import { ChainID } from "@/types/chain";
import { BridgeConstructorArgs, TransferOptions } from "@/types/bridge";

export class LnBridgeV2Opposite extends LnBridgeBase {
  constructor(args: BridgeConstructorArgs) {
    super(args);
    this._initContract();
  }

  private _initContract() {
    if (this.sourceChain?.id === ChainID.ARBITRUM && this.targetChain?.id === ChainID.ETHEREUM) {
      this.contract = {
        sourceAddress: "0x48d769d5C7ff75703cDd1543A1a2ed9bC9044A23",
        targetAddress: "0x48d769d5C7ff75703cDd1543A1a2ed9bC9044A23",
      };
    } else {
      this.contract = {
        sourceAddress: "0x4C538EfA6e3f9Dfb939AA4F0B224577DA665923a",
        targetAddress: "0x4C538EfA6e3f9Dfb939AA4F0B224577DA665923a",
      };
    }
  }

  protected async _transfer(
    _sender: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { askEstimateGas?: boolean },
  ): Promise<bigint | TransactionReceipt | undefined> {
    const account = await this.getSigner();
    const provider = options?.relayer;
    const transferId = options?.transferId;

    if (
      account &&
      provider &&
      transferId &&
      this.contract &&
      this.sourcePublicClient &&
      this.sourceToken &&
      this.targetToken &&
      this.targetChain
    ) {
      const askEstimateGas = options?.askEstimateGas ?? false;
      const totalFee = options?.totalFee ?? 0n;
      const snapshot = {
        remoteChainId: BigInt(this.targetChain.id),
        provider,
        sourceToken: this.sourceToken.address,
        targetToken: this.targetToken.address,
        transferId,
        totalFee: totalFee,
        depositedMargin: options?.depositedMargin || 0n,
      };

      const defaultParams = {
        address: this.contract.sourceAddress,
        abi: (await import(`../abi/lnv2-opposite`)).default,
        functionName: "transferAndLockMargin",
        args: [snapshot, amount, recipient],
        value: this.sourceToken.type === "native" ? amount + totalFee : undefined,
        gas: this.getTxGasLimit(),
        account,
      } as const;

      if (askEstimateGas) {
        return this.sourcePublicClient.estimateContractGas(defaultParams);
      } else if (this.walletClient) {
        const hash = await this.walletClient.writeContract(defaultParams);
        return this.sourcePublicClient.waitForTransactionReceipt({ hash });
      }
    }
  }

  async updateFeeAndMargin(margin: bigint, baseFee: bigint, feeRate: number) {
    await this.validateNetwork("source");

    if (
      this.contract &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken &&
      this.publicClient &&
      this.walletClient
    ) {
      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi: (await import(`../abi/lnv2-opposite`)).default,
        functionName: "updateProviderFeeAndMargin",
        args: [
          BigInt(this.targetChain.id),
          this.sourceToken.address,
          this.targetToken.address,
          margin,
          baseFee,
          feeRate,
        ],
        value: this.sourceToken.type === "native" ? margin : undefined,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }
}
