import { BridgeCategory, BridgeLogo, TransferOptions } from "@/types/bridge";
import { BaseBridge } from "./base";
import { ChainConfig, ChainID } from "@/types/chain";
import { Token } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { Address, TransactionReceipt, encodeAbiParameters } from "viem";

/**
 * L2 official bridge
 */

export class L2ArbitrumBridge extends BaseBridge {
  private readonly l2GasLimit = 600000n;
  private readonly l2FixedDataSize = 1600n;
  private readonly feeScaler = 1.1;
  private readonly l2GasPriceScaler = 3n; // To ensure a successful transaction, we set the scaler to be 3 times
  private helixDAO: Address | undefined;

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
    super(args);
    this.initContract();

    this.logo = args.logo ?? {
      horizontal: "l2arbitrum-horizontal.png",
      symbol: "l2arbitrum-symbol.png",
    };
    this.name = "L2Bridge";
    this.estimateTime = { min: 15, max: 20 };
  }

  private initContract() {
    if (this.sourceChain?.id === ChainID.GOERLI && this.targetChain?.id === ChainID.ARBITRUM_GOERLI) {
      this.contract = {
        sourceAddress: "0x0000000000000000000000000000000000000000",
        targetAddress: "0x4c7708168395aea569453fc36862d2ffcdac588c",
      };
    } else if (this.sourceChain?.id === ChainID.ETHEREUM && this.targetChain?.id === ChainID.ARBITRUM) {
      this.contract = {
        sourceAddress: "0x0000000000000000000000000000000000000000",
        targetAddress: "0x72ce9c846789fdb6fc1f34ac4ad25dd9ef7031ef",
      };
    }
    this.helixDAO = "0x3B9E571AdeCB0c277486036D6097E9C2CCcfa9d9";
  }

  protected async _transfer(
    _sender: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { estimateGas?: boolean },
  ): Promise<bigint | TransactionReceipt | undefined> {
    const params = await this.getL1toL2Params();
    const account = await this.getSigner();

    if (params && account && this.contract && this.sourceToken && this.sourcePublicClient && this.helixDAO) {
      const innerData = encodeAbiParameters(
        [
          { name: "x", type: "uint256" },
          { name: "y", type: "bytes" },
        ],
        [params.maxSubmissionCost, "0x"],
      );
      const estimateGas = options?.estimateGas ?? false;

      const defaultParams = {
        address: this.contract.sourceAddress,
        abi: (await import("@/abi/l1-gateway-router")).default,
        functionName: "outboundTransferCustomRefund",
        args: [this.sourceToken.address, this.helixDAO, recipient, amount, this.l2GasLimit, params.gasPrice, innerData],
        value: params.deposit,
        gas: this.getTxGasLimit(),
        account,
      } as const;

      if (estimateGas) {
        return this.sourcePublicClient.estimateContractGas(defaultParams);
      } else if (this.walletClient) {
        const hash = await this.walletClient.writeContract(defaultParams);
        return this.sourcePublicClient.waitForTransactionReceipt({ hash });
      }
    }
  }

  private async getL1toL2Params() {
    if (this.contract && this.sourcePublicClient && this.targetPublicClient) {
      const l1Client = this.sourcePublicClient;
      const l2Client = this.targetPublicClient;

      const l1BaseFee = (await l1Client.getBlock({ blockTag: "latest" })).baseFeePerGas || 0n;
      const l2GasPrice = await l2Client.getGasPrice();
      const scaleL1BaseFee = (l1BaseFee * BigInt(Math.floor(this.feeScaler * 100))) / 100n;
      const scaleL2GasPrice = l2GasPrice * this.l2GasPriceScaler;

      const inboxAddress = (await l1Client.readContract({
        address: this.contract.sourceAddress,
        abi: (await import("@/abi/l1-gateway-router")).default,
        functionName: "inbox",
      })) as unknown as Address;

      const maxSubmissionCost = (await l1Client.readContract({
        address: inboxAddress,
        abi: (await import("@/abi/inbox")).default,
        functionName: "calculateRetryableSubmissionFee",
        args: [this.l2FixedDataSize, scaleL1BaseFee],
      })) as unknown as bigint;

      const deposit = this.l2GasLimit * scaleL2GasPrice + maxSubmissionCost;
      const scaleDeposit = (deposit * BigInt(Math.floor(this.feeScaler * 100))) / 100n;

      return {
        maxSubmissionCost,
        gasPrice: scaleL2GasPrice,
        deposit: scaleDeposit,
      };
    }
  }

  async getFee() {
    const params = await this.getL1toL2Params();

    if (params && this.sourceNativeToken) {
      return { value: params.deposit, token: this.sourceNativeToken };
    }
  }
}
