import type { Network, TokenSymbol } from "../types";
import { PublicClient, TransactionReceipt, WalletClient } from "viem";
import { LnBridgeCommon } from "./lnbridge-common";
import { getChainConfig } from "../utils";

export class LnBridgeDefault extends LnBridgeCommon {
  constructor(args: {
    sourceChain: Network;
    targetChain: Network;
    sourceToken: TokenSymbol;
    targetToken: TokenSymbol;
    publicClient: PublicClient;
    walletClient: WalletClient;
  }) {
    super({
      sourceChain: args.sourceChain,
      targetChain: args.targetChain,
      sourceToken: args.sourceToken,
      targetToken: args.targetToken,
      publicClient: args.publicClient,
      walletClient: args.walletClient,
      category: "lnbridgev20-default",
    });
  }

  async transfer(
    _: string,
    receiver: string,
    amount: bigint,
    options: {
      relayer: string;
      sourceToken: string;
      transferId: string;
      totalFee: bigint;
      withdrawNonce: bigint;
    },
  ): Promise<TransactionReceipt | undefined> {
    const chainConfig = getChainConfig(this.sourceChain);
    const bridgeContract = chainConfig?.crossChain[this.targetChain]?.[this.category]?.bridgeContract;
    const walletAddress = (await this.walletClient.requestAddresses()).at(0);
    const token = chainConfig?.tokens.find(({ symbol }) => symbol === this.sourceToken);

    if (bridgeContract && walletAddress && token) {
      const abi = (await import(`../abi/lnbridgev20-default.json`)).default;
      const snapshot = [
        options.relayer,
        options.sourceToken,
        options.transferId,
        options.totalFee,
        options.withdrawNonce,
      ];

      const { request } = await this.publicClient.simulateContract({
        address: bridgeContract.sourceAddress,
        abi,
        functionName: "transferAndLockMargin",
        args: [snapshot, amount, receiver, { gasLimit: 1000000 }],
        value: token.type === "native" ? amount + options.totalFee : undefined,
      });
      const hash = await this.walletClient.writeContract(request);
      return await this.publicClient.waitForTransactionReceipt({ hash });
    }

    return;
  }
}
