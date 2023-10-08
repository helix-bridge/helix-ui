import { BridgeCategory } from "@/types/bridge";
import { BaseBridge } from "./base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { Address, TransactionReceipt, createPublicClient, encodeAbiParameters, http } from "viem";
import { getChainConfig } from "@/utils/chain";

/**
 * L2 official bridge
 */

export class L2ArbitrumBridge extends BaseBridge {
  private readonly l2GasLimit = 600000n;
  private readonly l2FixedDataSize = 1600n;
  private readonly feeScaler = 1.1;
  private readonly l2GasPriceScaler = 3n; // To ensure a successful transaction, we set the scaler to be 3 times
  private helixDaoAddress: Address | undefined;

  constructor(args: {
    category: BridgeCategory;

    sourceChain?: Network;
    targetChain?: Network;
    sourceToken?: TokenSymbol;
    targetToken?: TokenSymbol;

    publicClient?: PublicClient;
    walletClient?: WalletClient | null;
  }) {
    super(args);
    this.initContract();

    this.logo = {
      horizontal: "l2arbitrum-horizontal.png",
      symbol: "l2arbitrum-symbol.png",
    };
    this.name = "L2Bridge";
    this.estimateTime = { min: 15, max: 20 };
  }

  private initContract() {
    if (this.sourceChain === "goerli" && this.targetChain === "arbitrum-goerli") {
      this.contract = {
        sourceAddress: "0x0000000000000000000000000000000000000000",
        targetAddress: "0x4c7708168395aea569453fc36862d2ffcdac588c",
      };
      this.helixDaoAddress = "0x3B9E571AdeCB0c277486036D6097E9C2CCcfa9d9";
    } else if (this.sourceChain === "ethereum" && this.targetChain === "arbitrum") {
      this.contract = {
        sourceAddress: "0x0000000000000000000000000000000000000000",
        targetAddress: "0x72ce9c846789fdb6fc1f34ac4ad25dd9ef7031ef",
      };
      this.helixDaoAddress = "0x3B9E571AdeCB0c277486036D6097E9C2CCcfa9d9";
    }
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
        gas: this.getTxGasLimit(),
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

  async getFee() {
    const params = await this.getL1toL2Params();

    const sourceChainConfig = getChainConfig(this.sourceChain);
    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === this.sourceToken);

    if (params && sourceTokenConfig) {
      return { value: params.deposit, token: sourceTokenConfig };
    }
  }
}
