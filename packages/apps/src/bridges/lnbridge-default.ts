import { TransactionReceipt } from "viem";
import { LnBridgeBase } from "./lnbridge-base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { getChainConfig } from "@/utils/chain";
import { PublicClient, WalletClient } from "wagmi";
import { isProduction } from "@/utils/env";

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
        sourceAddress: "0x4C538EfA6e3f9Dfb939AA4F0B224577DA665923a",
        targetAddress: "0x4C538EfA6e3f9Dfb939AA4F0B224577DA665923a",
      };
    } else if (!isProduction()) {
      this.contract = {
        sourceAddress: "0x7e101911E5FB461d78FBde3992f76F3Bf8BbA829",
        targetAddress: "0x7e101911E5FB461d78FBde3992f76F3Bf8BbA829",
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
