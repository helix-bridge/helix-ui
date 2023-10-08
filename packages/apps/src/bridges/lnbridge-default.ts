import { TransactionReceipt } from "viem";
import { LnBridgeBase } from "./lnbridge-base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { getChainConfig } from "@/utils/chain";
import { PublicClient, WalletClient } from "wagmi";

export class LnBridgeDefault extends LnBridgeBase {
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
      category: "lnbridgev20-default",
    });
    this.initContract();
  }

  private initContract() {
    if (this.sourceChain === "linea-goerli" && this.targetChain === "goerli") {
      this.contract = {
        sourceAddress: "0x79e6f452f1e491a7aF0382FA0a6EF9368691960D",
        targetAddress: "0x79e6f452f1e491a7aF0382FA0a6EF9368691960D",
      };
    } else if (process.env.NODE_ENV !== "production") {
      this.contract = {
        sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
        targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
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
      withdrawNonce: bigint;
    },
  ): Promise<TransactionReceipt | undefined> {
    const token = getChainConfig(this.sourceChain)?.tokens.find(({ symbol }) => symbol === this.sourceToken);

    if (this.contract && this.publicClient && this.walletClient && token) {
      const abi = (await import(`../abi/lnbridgev20-default.json`)).default;
      const snapshot = [
        options.remoteChainId,
        options.relayer,
        options.sourceToken,
        options.targetToken,
        options.transferId,
        options.totalFee,
        options.withdrawNonce,
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
