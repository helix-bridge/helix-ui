import { TransactionReceipt } from "viem";
import { LnBridgeBase } from "./lnbridge-base";
import { ChainConfig, ChainID } from "@/types/chain";
import { Token } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { BridgeCategory, BridgeLogo } from "@/types/bridge";

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
    super({
      ...args,
      category: "lnbridgev20-opposite",
    });
    this.initContract();
  }

  private initContract() {
    if (this.sourceChain?.id === ChainID.ARBITRUM && this.targetChain?.id === ChainID.ETHEREUM) {
      this.contract = {
        sourceAddress: "0xD1B10B114f1975d8BCc6cb6FC43519160e2AA978",
        targetAddress: "0xeAb1F01a8f4A2687023B159c2063639Adad5304E",
      };
    } else if (this.sourceChain?.id === ChainID.LINEA_GOERLI && this.targetChain?.id === ChainID.GOERLI) {
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
    options: {
      remoteChainId: bigint;
      relayer: string;
      sourceToken: string;
      targetToken: string;
      transferId: string;
      totalFee: bigint;
      depositedMargin: bigint;
    },
  ): Promise<TransactionReceipt | undefined> {
    if ((await this.publicClient?.getChainId()) !== this.sourceChain?.id) {
      throw new Error("Wrong network");
    }

    if (this.contract && this.sourceToken && this.publicClient && this.walletClient) {
      const abi = (await import(`../abi/lnbridgev20-opposite.json`)).default;
      const snapshot = [
        options.remoteChainId,
        options.relayer,
        options.sourceToken,
        options.targetToken,
        options.transferId,
        options.totalFee,
        options.depositedMargin,
      ];

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi,
        functionName: "transferAndLockMargin",
        args: [snapshot, amount, recipient],
        value: this.sourceToken.type === "native" ? amount + options.totalFee : undefined,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async updateFeeAndMargin(margin: bigint, baseFee: bigint, feeRate: number) {
    if ((await this.publicClient?.getChainId()) !== this.sourceChain?.id) {
      throw new Error("Wrong network");
    }

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
