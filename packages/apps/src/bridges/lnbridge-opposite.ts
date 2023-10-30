import { Address, TransactionReceipt } from "viem";
import { LnBridgeBase } from "./lnbridge-base";
import { ChainConfig, ChainID } from "@/types/chain";
import { Token } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { BridgeCategory, BridgeLogo, TransferOptions } from "@/types/bridge";

export class LnBridgeOpposite extends LnBridgeBase {
  constructor(args: {
    walletClient?: WalletClient | null;
    publicClient?: PublicClient;
    category: BridgeCategory;
    logo?: BridgeLogo;

    sourceChain?: ChainConfig;
    targetChain?: ChainConfig;
    sourceToken?: Token;
    targetToken?: Token;
  }) {
    super(args);
    this.initContract();
  }

  private initContract() {
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
    options?: TransferOptions & { estimateGas?: boolean },
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
      const estimateGas = options?.estimateGas ?? false;
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
        abi: (await import(`../abi/lnbridgev20-opposite`)).default,
        functionName: "transferAndLockMargin",
        args: [snapshot, amount, recipient],
        value: this.sourceToken.type === "native" ? amount + totalFee : undefined,
        gas: this.getTxGasLimit(),
        account,
      } as const;

      if (estimateGas) {
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
      const abi = (await import(`../abi/lnbridgev20-opposite`)).default;

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi,
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
