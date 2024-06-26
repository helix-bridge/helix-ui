import { Address, Hex, TransactionReceipt } from "viem";
import { LnBridgeBase } from "./lnbridge-base";
import { isMainnet } from "../utils/env";
import { BridgeConstructorArgs, TransferOptions } from "../types/bridge";

export class LnBridgeV2Default extends LnBridgeBase {
  constructor(args: BridgeConstructorArgs) {
    super(args);
    this._initContract();
  }

  private _initContract() {
    if (this.sourceChain?.network === "zksync-sepolia") {
      this.contract = {
        sourceAddress: "0xBe23e871318E49C747CB909AC65aCCFAEAac3a37",
        targetAddress: "0x8429D7Dfd91D6F970ba89fFC005e67D15f1E4739",
      };
    } else if (this.targetChain?.network === "zksync-sepolia") {
      this.contract = {
        sourceAddress: "0x8429D7Dfd91D6F970ba89fFC005e67D15f1E4739",
        targetAddress: "0xBe23e871318E49C747CB909AC65aCCFAEAac3a37",
      };
    } else if (this.sourceChain?.network === "zksync") {
      this.contract = {
        sourceAddress: "0x767Bc046c989f5e63683fB530f939DD34b91ceAC",
        targetAddress: "0x94C614DAeFDbf151E1BB53d6A201ae5fF56A9337",
      };
    } else if (this.targetChain?.network === "zksync") {
      this.contract = {
        sourceAddress: "0x94C614DAeFDbf151E1BB53d6A201ae5fF56A9337",
        targetAddress: "0x767Bc046c989f5e63683fB530f939DD34b91ceAC",
      };
    } else if (isMainnet()) {
      this.contract = {
        sourceAddress: "0x94C614DAeFDbf151E1BB53d6A201ae5fF56A9337",
        targetAddress: "0x94C614DAeFDbf151E1BB53d6A201ae5fF56A9337",
      };
    } else {
      this.contract = {
        sourceAddress: "0x8429D7Dfd91D6F970ba89fFC005e67D15f1E4739",
        targetAddress: "0x8429D7Dfd91D6F970ba89fFC005e67D15f1E4739",
      };
    }
  }

  protected async _transfer(
    _sender: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { askEstimateGas?: boolean },
  ): Promise<bigint | TransactionReceipt | undefined> {
    const account = await this.getSigner();
    const provider = options?.relayer;
    const transferId = options?.transferId;

    if (
      account &&
      provider &&
      transferId &&
      this.contract &&
      this.sourcePublicClient &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken
    ) {
      const askEstimateGas = options?.askEstimateGas ?? false;
      const totalFee = options?.totalFee ?? 0n;
      const snapshot = {
        remoteChainId: BigInt(this.targetChain.id),
        provider,
        sourceToken: this.sourceToken.address,
        targetToken: this.targetToken.address,
        transferId,
        totalFee: totalFee,
        withdrawNonce: options?.withdrawNonce || 0n,
      };

      const defaultParams = {
        address: this.contract.sourceAddress,
        abi: (await import(`../abi/lnv2-default`)).default,
        functionName: "transferAndLockMargin",
        args: [snapshot, amount, recipient],
        value: this.sourceToken.type === "native" ? amount + totalFee : undefined,
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

  async depositMargin(margin: bigint) {
    await this.validateNetwork("target");

    if (
      this.contract &&
      this.sourceChain &&
      this.sourceToken &&
      this.targetToken &&
      this.publicClient &&
      this.walletClient
    ) {
      const hash = await this.walletClient.writeContract({
        address: this.contract.targetAddress,
        abi: (await import(`../abi/lnv2-default`)).default,
        functionName: "depositProviderMargin",
        args: [BigInt(this.sourceChain.id), this.sourceToken.address, this.targetToken.address, margin],
        value: this.targetToken.type === "native" ? margin : undefined,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async setFeeAndRate(baseFee: bigint, feeRate: number) {
    await this.validateNetwork("source");

    if (
      this.contract &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken &&
      this.publicClient &&
      this.walletClient
    ) {
      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi: (await import(`../abi/lnv2-default`)).default,
        functionName: "setProviderFee",
        args: [BigInt(this.targetChain.id), this.sourceToken.address, this.targetToken.address, baseFee, feeRate],
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async withdrawMargin(recipientOrParams: Address | Hex, amount: bigint, fee: bigint) {
    await this.validateNetwork("source");

    if (
      this.contract &&
      this.sourceToken &&
      this.targetToken &&
      this.targetChain &&
      this.publicClient &&
      this.walletClient
    ) {
      const remoteChainId = BigInt(this.targetChain.id);

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi: (await import(`../abi/lnv2-default`)).default,
        functionName: "requestWithdrawMargin",
        args: [remoteChainId, this.sourceToken.address, this.targetToken.address, amount, recipientOrParams],
        gas: this.getTxGasLimit(),
        value: fee,
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }
}
