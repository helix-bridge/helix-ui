import { BridgeCategory, BridgeContract } from "@/types/bridge";
import { BaseBridge } from "./base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { TransactionReceipt, createPublicClient, encodeAbiParameters, http } from "viem";
import { getChainConfig } from "@/utils/chain";

/**
 * L2 official bridge
 */

export class L2ArbitrumBridge extends BaseBridge {
  private readonly l2GasLimit = 600000n;
  private readonly l2FixedDataSize = 1600n;
  private readonly feeScaler = 1.1;
  // To ensure a successful transaction, we set the scaler to be 3 times
  private readonly l2GasPriceScaler = 3n;
  private readonly helixDaoAddress = "0x3B9E571AdeCB0c277486036D6097E9C2CCcfa9d9";

  constructor(args: {
    category: BridgeCategory;
    contract?: BridgeContract;

    sourceChain?: Network;
    targetChain?: Network;
    sourceToken?: TokenSymbol;
    targetToken?: TokenSymbol;

    publicClient?: PublicClient;
    walletClient?: WalletClient | null;
  }) {
    super(args);

    this.logo = {
      horizontal: "l2arbitrum-horizontal.png",
      symbol: "l2arbitrum-symbol.png",
    };
    this.name = "L2Bridge";
  }

  async transfer(
    _: string,
    recipient: string,
    amount: bigint,
    // options?: Object | undefined,
  ): Promise<TransactionReceipt | undefined> {
    const params = await this.getL1toL2Params();

    const sourceChainConfig = getChainConfig(this.sourceChain);
    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);

    if (this.contract && this.publicClient && this.walletClient && params && sourceTokenConfig) {
      const innerData = encodeAbiParameters(
        [
          { name: "x", type: "uint256" },
          { name: "y", type: "bytes" },
        ],
        [params.maxSubmissionCost, "0x"],
      );

      const gas = this.sourceChain === "arbitrum" || this.sourceChain === "arbitrum-goerli" ? 1000000n : undefined;
      const abi = (await import("@/abi/l1-gateway-router.json")).default;

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi,
        functionName: "outboundTransferCustomRefund",
        args: [
          sourceTokenConfig.address,
          this.helixDaoAddress,
          recipient,
          amount,
          this.l2GasLimit,
          params.gasPrice,
          innerData,
        ],
        value: params.gasPrice,
        gas,
      });
      return await this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  private async getL1toL2Params() {
    const sourceChainConfig = getChainConfig(this.sourceChain);
    const targetChainConfig = getChainConfig(this.targetChain);

    if (sourceChainConfig && targetChainConfig && this.contract && this.publicClient) {
      const l1Client = createPublicClient({ chain: sourceChainConfig, transport: http() });
      const l2Client = createPublicClient({ chain: targetChainConfig, transport: http() });

      const l1BaseFee = (await l1Client.getBlock({ blockTag: "latest" })).baseFeePerGas || 0n;
      const l2GasPrice = await l2Client.getGasPrice();
      const scaleL1BaseFee = (l1BaseFee * BigInt(this.feeScaler * 100)) / 100n;
      const scaleL2GasPrice = l2GasPrice * this.l2GasPriceScaler;

      const inboxAddress = (await this.publicClient.readContract({
        address: this.contract.sourceAddress,
        abi: (await import("@/abi/l1-gateway-router.json")).default,
        functionName: "inbox",
      })) as unknown as `0x${string}`;

      const maxSubmissionCost = (await this.publicClient.readContract({
        address: inboxAddress,
        abi: (await import("@/abi/inbox.json")).default,
        functionName: "calculateRetryableSubmissionFee",
        args: [this.l2FixedDataSize, scaleL1BaseFee],
      })) as unknown as bigint;

      const deposit = this.l2GasLimit * scaleL2GasPrice + maxSubmissionCost;
      const scaleDeposit = (deposit * BigInt(this.feeScaler * 100)) / 100n;

      return {
        maxSubmissionCost,
        gasPrice: scaleL2GasPrice,
        deposit: scaleDeposit,
      };
    }
  }

  async getFee(..._: unknown[]) {
    const params = await this.getL1toL2Params();

    const sourceChainConfig = getChainConfig(this.sourceChain);
    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);

    if (params && sourceTokenConfig) {
      return { amount: params.deposit, symbol: sourceTokenConfig.symbol };
    }

    return undefined;
  }

  getEstimateTime() {
    return "15-20 Minutes";
  }
}
