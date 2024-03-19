import { BridgeConstructorArgs, TransferOptions } from "@/types/bridge";
import { BaseBridge } from "./base";
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

  constructor(args: BridgeConstructorArgs) {
    super(args);
    this._initContract();

    this.logo = {
      horizontal: "l2arbitrum-horizontal.png",
      symbol: "l2arbitrum-symbol.png",
    };
    this.name = "L2Bridge";
    this.estimateTime = { min: 15, max: 20 };
  }

  private _initContract() {
    if (this.sourceChain?.network === "sepolia" && this.targetChain?.network === "arbitrum-sepolia") {
      this.contract = {
        sourceAddress: "0x0000000000000000000000000000000000000000",
        targetAddress: "0x4c7708168395aea569453fc36862d2ffcdac588c",
      };
    } else if (this.sourceChain?.network === "ethereum" && this.targetChain?.network === "arbitrum") {
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
    options?: TransferOptions & { askEstimateGas?: boolean },
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
      const askEstimateGas = options?.askEstimateGas ?? false;

      const defaultParams = {
        address: this.contract.sourceAddress,
        abi: (await import("@/abi/l1-gateway-router")).default,
        functionName: "outboundTransferCustomRefund",
        args: [this.sourceToken.address, this.helixDAO, recipient, amount, this.l2GasLimit, params.gasPrice, innerData],
        value: params.deposit,
        gas: this.getTxGasLimit(),
        account,
      } as const;

      if (askEstimateGas) {
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

      const inboxAddress = await l1Client.readContract({
        address: this.contract.sourceAddress,
        abi: (await import("@/abi/l1-gateway-router")).default,
        functionName: "inbox",
      });

      const maxSubmissionCost = await l1Client.readContract({
        address: inboxAddress,
        abi: (await import("@/abi/inbox")).default,
        functionName: "calculateRetryableSubmissionFee",
        args: [this.l2FixedDataSize, scaleL1BaseFee],
      });

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
