import { TransactionReceipt } from "viem";
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

  async transfer(
    _: string,
    recipient: string,
    amount: bigint,
    options: Pick<TransferOptions, "relayer" | "transferId" | "totalFee" | "depositedMargin">,
  ): Promise<TransactionReceipt | undefined> {
    await this.validateNetwork("source");

    if (this.contract && this.publicClient && this.walletClient) {
      const abi = (await import(`../abi/lnbridgev20-opposite.json`)).default;
      const snapshot = [
        this.targetChain?.id,
        options.relayer,
        this.sourceToken?.address,
        this.targetToken?.address,
        options.transferId,
        options.totalFee,
        options.depositedMargin,
      ];
      console.log("snapshot:", snapshot);

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi,
        functionName: "transferAndLockMargin",
        args: [snapshot, amount, recipient],
        value: this.sourceToken?.type === "native" ? amount + options.totalFee : undefined,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
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
      const abi = (await import(`../abi/lnbridgev20-opposite.json`)).default;

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
