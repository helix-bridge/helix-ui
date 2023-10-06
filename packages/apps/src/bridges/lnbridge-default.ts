import { TransactionReceipt } from "viem";
import { LnBridgeBase } from "./lnbridge-base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { BridgeContract } from "@/types/bridge";
import { getChainConfig } from "@/utils/chain";
import { PublicClient, WalletClient } from "wagmi";

export class LnBridgeDefault extends LnBridgeBase {
  constructor(args: {
    contract?: BridgeContract;
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
    if (this.contract && this.publicClient && this.walletClient) {
      const token = getChainConfig(this.sourceChain)?.tokens.find(({ symbol }) => symbol === this.sourceToken);

      if (token) {
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
          gas: this.sourceChain === "arbitrum" || this.sourceChain === "arbitrum-goerli" ? 1000000n : undefined,
        });
        return await this.publicClient.waitForTransactionReceipt({ hash });
      }
    }

    return;
  }
}
