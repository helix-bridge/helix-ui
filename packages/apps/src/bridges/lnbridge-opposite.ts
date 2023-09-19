import { PublicClient, TransactionReceipt, WalletClient } from "viem";
import { LnBridgeCommon } from "./lnbridge-common";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { BridgeContract } from "@/types/bridge";
import { getChainConfig } from "@/utils/chain";

export class LnBridgeOpposite extends LnBridgeCommon {
  constructor(args: {
    contract?: BridgeContract;
    sourceChain?: Network;
    targetChain?: Network;
    sourceToken?: TokenSymbol;
    targetToken?: TokenSymbol;
    publicClient?: PublicClient;
    walletClient?: WalletClient;
  }) {
    super({
      ...args,
      category: "lnbridgev20-opposite",
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
      depositedMargin: bigint;
      totalFee: bigint;
    },
  ): Promise<TransactionReceipt | undefined> {
    if (this.contract && this.publicClient && this.walletClient) {
      const token = getChainConfig(this.sourceChain)?.tokens.find(({ symbol }) => symbol === this.sourceToken);

      if (token) {
        const abi = (await import(`../abi/lnbridgev20-opposite.json`)).default;
        const snapshot = [
          options.relayer,
          options.sourceToken,
          options.transferId,
          options.depositedMargin,
          options.totalFee,
        ];

        const { request } = await this.publicClient.simulateContract({
          address: this.contract.sourceAddress,
          abi,
          functionName: "transferAndLockMargin",
          args: [snapshot, amount, receiver, { gasLimit: 1000000 }],
          value: token.type === "native" ? amount + options.totalFee : undefined,
        });
        const hash = await this.walletClient.writeContract(request);
        return await this.publicClient.waitForTransactionReceipt({ hash });
      }
    }

    return;
  }
}
