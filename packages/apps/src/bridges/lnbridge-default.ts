import { TransactionReceipt } from "viem";
import { LnBridgeBase } from "./lnbridge-base";
import { ChainConfig, ChainID } from "@/types/chain";
import { Token } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { isProduction } from "@/utils/env";
import { BridgeCategory, BridgeLogo } from "@/types/bridge";

export class LnBridgeDefault extends LnBridgeBase {
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
      category: "lnbridgev20-default",
    });
    this.initContract();
  }

  private initContract() {
    if (this.sourceChain?.id === ChainID.LINEA_GOERLI && this.targetChain?.id === ChainID.GOERLI) {
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
    if ((await this.publicClient?.getChainId()) !== this.sourceChain?.id) {
      throw new Error("Wrong network");
    }

    if (this.contract && this.sourceToken && this.publicClient && this.walletClient) {
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
        value: this.sourceToken.type === "native" ? amount + options.totalFee : undefined,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }
}
