import { TransactionReceipt } from "viem";
import { LnBridgeBase } from "./lnbridge-base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { getChainConfig } from "@/utils/chain";
import { PublicClient, WalletClient } from "wagmi";

export class LnBridgeOpposite extends LnBridgeBase {
  constructor(args: {
    sourceChain?: Network;
    targetChain?: Network;
    sourceToken?: TokenSymbol;
    targetToken?: TokenSymbol;
    publicClient?: PublicClient;
    walletClient?: WalletClient | null;
  }) {
    super({
      ...args,
      category: "lnbridgev20-opposite",
    });
    this.initContract();
  }

  private initContract() {
    if (this.sourceChain === "arbitrum" && this.targetChain === "ethereum") {
      this.contract = {
        sourceAddress: "0xD1B10B114f1975d8BCc6cb6FC43519160e2AA978",
        targetAddress: "0xeAb1F01a8f4A2687023B159c2063639Adad5304E",
      };
    } else if (this.sourceChain === "linea-goerli" && this.targetChain === "goerli") {
      this.contract = {
        sourceAddress: "0x79e6f452f1e491a7aF0382FA0a6EF9368691960D",
        targetAddress: "0x79e6f452f1e491a7aF0382FA0a6EF9368691960D",
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
    const token = getChainConfig(this.sourceChain)?.tokens.find(({ symbol }) => symbol === this.sourceToken);

    if (this.contract && this.publicClient && this.walletClient && token) {
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
        value: token.type === "native" ? amount + options.totalFee : undefined,
        gas: this.getTxGasLimit(),
      });
      return await this.publicClient.waitForTransactionReceipt({ hash });
    }
  }
}
