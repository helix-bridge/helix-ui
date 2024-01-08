import { BridgeConstructorArgs, GetFeeArgs, TransferOptions } from "@/types/bridge";
import { BaseBridge } from "./base";
import { Address, TransactionReceipt } from "viem";
import { HistoryRecord } from "@/types/graphql";

export class HelixLpBridge extends BaseBridge {
  private readonly prefix = BigInt("0x6878000000000000");
  private readonly feePercent = 0.003; // 0.3%
  private readonly relayGasLimit = 100000n;

  constructor(args: BridgeConstructorArgs) {
    const sourceToken = args.sourceToken ? { ...args.sourceToken } : undefined; // DON'T USE `const sourceToken = args.sourceToken`
    const targetToken = args.targetToken ? { ...args.targetToken } : undefined;
    if (args.sourceChain?.network === "darwinia-dvm" && sourceToken?.symbol === "RING") {
      sourceToken.address = "0xE7578598Aac020abFB918f33A20faD5B71d670b4";
    } else if (args.targetChain?.network === "darwinia-dvm" && targetToken?.symbol === "RING") {
      targetToken.address = "0xE7578598Aac020abFB918f33A20faD5B71d670b4";
    }
    super({ ...args, sourceToken, targetToken });

    this._initContract();

    this.logo = {
      horizontal: "helix-horizontal.svg",
      symbol: "helix-symbol.svg",
    };
    this.name = "Helix(Fusion)";
    this.estimateTime = { min: 1, max: 3 };
  }

  private _initContract() {
    const backing = "0x84f7a56483C100ECb12CbB4A31b7873dAE0d8E9B";
    const issuing = "0x5F8D4232367759bCe5d9488D3ade77FCFF6B9b6B";
    this.initContractByBackingIssuing(backing, issuing);
  }

  protected async _transfer(
    _sender: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { askEstimateGas?: boolean },
  ): Promise<bigint | TransactionReceipt | undefined> {
    const account = await this.getSigner();
    if (account && this.contract && this.sourcePublicClient) {
      const nonce = BigInt(Date.now()) + this.prefix;
      const tokenIndex = this.crossInfo?.index ?? 0;
      const totalFee = options?.totalFee ?? 0n;
      const askEstimateGas = options?.askEstimateGas ?? false;

      const abi = (await import("@/abi/lpbridge")).default;
      const address = this.contract.sourceAddress;
      const gas = this.getTxGasLimit();

      const defaultParams = {
        address,
        abi,
        gas,
        functionName: "lockAndRemoteIssuing",
        args: [nonce, recipient, amount, totalFee, tokenIndex, this.targetToken?.type === "native"],
        account,
      } as const;
      const nativeParams = {
        address,
        abi,
        gas,
        functionName: "lockNativeAndRemoteIssuing",
        args: [amount, totalFee, recipient, nonce, this.targetToken?.type === "native"],
        value: amount + totalFee,
        account,
      } as const;

      if (askEstimateGas) {
        return this.sourceToken?.type === "native"
          ? this.sourcePublicClient.estimateContractGas(nativeParams)
          : this.sourcePublicClient.estimateContractGas(defaultParams);
      } else if (this.walletClient) {
        const hash = await (this.sourceToken?.type === "native"
          ? this.walletClient.writeContract(nativeParams)
          : this.walletClient.writeContract(defaultParams));
        return this.sourcePublicClient.waitForTransactionReceipt({ hash });
      }
    }
  }

  /**
   * On target chain
   */
  async refund(record: HistoryRecord) {
    await this.validateNetwork("target");

    if (this.contract && this.publicClient && this.walletClient) {
      const hash = await this.walletClient.writeContract({
        address: this.contract.targetAddress,
        abi: (await import("@/abi/lpbridge-sub2eth")).default,
        functionName: "requestCancelIssuing",
        args: [
          BigInt(record.messageNonce || 0),
          this.targetToken?.type === "native",
          record.recvTokenAddress || "0x",
          record.sender,
          record.recipient,
          BigInt(record.sendAmount),
          BigInt(record.id.split("-").at(1) || 0),
          this.sourceToken?.type === "native",
        ],
        value: await this.getBridgeFee(),
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  private async getBridgeFee() {
    if (this.contract && this.sourcePublicClient) {
      return this.sourcePublicClient.readContract({
        address: this.contract.sourceAddress,
        abi: (await import("@/abi/lpbridge")).default,
        functionName: "fee",
      }); // Native token
    }
  }

  async speedUp(record: HistoryRecord, fee: bigint) {
    if (this.contract && this.walletClient && this.publicClient) {
      const transferId = record.id.split("-").slice(-1).join("") as Address;

      const abi = (await import("@/abi/lpbridge")).default;
      const address = this.contract.sourceAddress;
      const gas = this.getTxGasLimit();

      const hash = await (this.sourceToken?.type === "native"
        ? this.walletClient.writeContract({
            address,
            abi,
            gas,
            functionName: "increaseNativeFee",
            args: [transferId],
            value: fee,
          })
        : this.walletClient.writeContract({ address, abi, gas, functionName: "increaseFee", args: [transferId, fee] }));
      return await this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async getFee(args?: GetFeeArgs) {
    if (this.sourceToken && this.crossInfo?.baseFee && this.targetPublicClient) {
      let value =
        ((args?.transferAmount || 0n) * BigInt(Math.floor(this.feePercent * 1000))) / 1000n + this.crossInfo.baseFee;

      if (this.crossInfo.price) {
        const gasPrice = await this.targetPublicClient.getGasPrice();
        const dynamicFee = gasPrice * this.crossInfo.price * this.relayGasLimit;
        value += dynamicFee;
      }

      return { value, token: this.sourceToken };
    }
  }

  async getDailyLimit() {
    if (this.sourceToken) {
      return { limit: BigInt("500000000000000000000000"), spent: 0n, token: this.sourceToken };
    }
  }
}
