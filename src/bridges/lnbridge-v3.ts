import { isMainnet } from "../utils/env";
import { BridgeConstructorArgs, GetFeeArgs, MessageChannel, Token, TransferOptions } from "../types";
import { LnBridgeBase } from "./lnbridge-base";
import { Address, Hex, TransactionReceipt, encodeFunctionData, encodePacked, keccak256 } from "viem";

export class LnBridgeV3 extends LnBridgeBase {
  constructor(args: BridgeConstructorArgs) {
    super(args);
    this.name = "Helix LnBridge(v3)";
    this._initContract();
  }

  private _initContract() {
    if (isMainnet()) {
      let sourceAddress: Address = "0xbA5D580B18b6436411562981e02c8A9aA1776D10";
      let targetAddress: Address = "0xbA5D580B18b6436411562981e02c8A9aA1776D10";

      if (this.sourceChain?.network === "blast") {
        sourceAddress = "0xB180D7DcB5CC161C862aD60442FA37527546cAFC";
      } else if (this.targetChain?.network === "blast") {
        targetAddress = "0xB180D7DcB5CC161C862aD60442FA37527546cAFC";
      }
      if (this.sourceChain?.network === "astar-zkevm") {
        sourceAddress = "0xD476650e03a45E70202b0bcAfa04E1513920f83a";
      } else if (this.targetChain?.network === "astar-zkevm") {
        targetAddress = "0xD476650e03a45E70202b0bcAfa04E1513920f83a";
      }
      this.contract = { sourceAddress, targetAddress };
    } else {
      let sourceAddress: Address = "0x38627Cb033De66a1E07e73f5D0a7a7adFB6741fa";
      let targetAddress: Address = "0x38627Cb033De66a1E07e73f5D0a7a7adFB6741fa";

      if (this.sourceChain?.network === "zksync-sepolia") {
        sourceAddress = "0xDc55fF59F82AA50D8A4A61dB8CcaDffD26Fb7dD2";
      } else if (this.sourceChain?.network === "bera") {
        sourceAddress = "0x00e7EFf0826dfCDf2AA5945dFF710B48f4AA7E64";
      } else if (this.sourceChain?.network === "taiko-hekla") {
        sourceAddress = "0xD476650e03a45E70202b0bcAfa04E1513920f83a";
      } else if (this.sourceChain?.network === "morph") {
        sourceAddress = "0xD476650e03a45E70202b0bcAfa04E1513920f83a";
      }

      if (this.targetChain?.network === "zksync-sepolia") {
        targetAddress = "0xDc55fF59F82AA50D8A4A61dB8CcaDffD26Fb7dD2";
      } else if (this.targetChain?.network === "bera") {
        targetAddress = "0x00e7EFf0826dfCDf2AA5945dFF710B48f4AA7E64";
      } else if (this.targetChain?.network === "taiko-hekla") {
        targetAddress = "0xD476650e03a45E70202b0bcAfa04E1513920f83a";
      } else if (this.targetChain?.network === "morph") {
        targetAddress = "0xD476650e03a45E70202b0bcAfa04E1513920f83a";
      }

      this.contract = { sourceAddress, targetAddress };
    }
  }

  protected async _transfer(
    _sender: `0x${string}`,
    recipient: `0x${string}`,
    amount: bigint,
    options?: (TransferOptions & { askEstimateGas?: boolean | undefined }) | undefined,
  ): Promise<bigint | TransactionReceipt | undefined> {
    const account = await this.getSigner();
    const provider = options?.relayer;

    if (
      account &&
      provider &&
      this.contract &&
      this.sourcePublicClient &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken
    ) {
      const askEstimateGas = options?.askEstimateGas ?? false;
      const totalFee = options?.totalFee ?? 0n;

      const defaultParams = {
        address: this.contract.sourceAddress,
        abi: (await import("../abi/lnbridge-v3")).default,
        functionName: "lockAndRemoteRelease",
        args: [
          {
            remoteChainId: BigInt(this.targetChain.id),
            provider,
            sourceToken: this.sourceToken.address,
            targetToken: this.targetToken.address,
            totalFee,
            amount,
            receiver: recipient,
            timestamp: BigInt(Math.floor(Date.now() / 1000)),
          },
        ],
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

  async getFee(args?: GetFeeArgs | undefined): Promise<{ value: bigint; token: Token } | undefined> {
    const provider = args?.relayer;
    if (
      provider &&
      this.sourcePublicClient &&
      this.contract &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken
    ) {
      return {
        value: await this.sourcePublicClient.readContract({
          address: this.contract.sourceAddress,
          abi: (await import("../abi/lnbridge-v3")).default,
          functionName: "totalFee",
          args: [
            BigInt(this.targetChain.id),
            provider,
            this.sourceToken.address,
            this.targetToken.address,
            args.transferAmount ?? 0n,
          ],
        }),
        token: this.sourceToken,
      };
    }
  }

  async getPenaltyReserves(relayer: Address | null | undefined) {
    if (relayer && this.contract && this.sourceToken && this.sourcePublicClient) {
      const value = await this.sourcePublicClient.readContract({
        address: this.contract.sourceAddress,
        abi: (await import("../abi/lnbridge-v3")).default,
        functionName: "penaltyReserves",
        args: [keccak256(encodePacked(["address", "address"], [this.sourceToken.address, relayer]))],
      });
      return { value, token: this.sourceToken };
    }
  }

  async registerLnProvider(baseFee: bigint, feeRate: number, transferLimit: bigint) {
    await this.validateNetwork("source");

    if (
      this.contract &&
      this.publicClient &&
      this.walletClient &&
      this.targetChain &&
      this.sourceToken &&
      this.targetToken
    ) {
      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi: (await import("../abi/lnbridge-v3")).default,
        functionName: "registerLnProvider",
        args: [
          BigInt(this.targetChain.id),
          this.sourceToken.address,
          this.targetToken.address,
          baseFee,
          feeRate,
          transferLimit,
        ],
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async depositPenaltyReserve(amount: bigint) {
    await this.validateNetwork("source");

    if (this.contract && this.publicClient && this.walletClient && this.sourceToken) {
      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi: (await import("../abi/lnbridge-v3")).default,
        functionName: "depositPenaltyReserve",
        args: [this.sourceToken.address, amount],
        value: this.sourceToken.type === "native" ? amount : undefined,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async withdrawPenaltyReserve(amount: bigint) {
    await this.validateNetwork("source");

    if (this.contract && this.sourceToken && this.publicClient && this.walletClient) {
      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi: (await import("../abi/lnbridge-v3")).default,
        functionName: "withdrawPenaltyReserve",
        args: [this.sourceToken.address, amount],
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async getWithdrawLiquidityFeeAndParams(relayer: Address, transferIds: Hex[], messageChannel: MessageChannel) {
    if (messageChannel === "layerzero") {
      if (this.contract && this.sourceChain && this.targetNativeToken && this.targetPublicClient) {
        const [sendService] = await this.targetPublicClient.readContract({
          address: this.contract.targetAddress,
          abi: (await import("../abi/lnbridge-v3")).default,
          functionName: "messagers",
          args: [BigInt(this.sourceChain.id)],
        });
        const value = await this._getLayerzeroFee(sendService, this.sourceChain, this.targetPublicClient);
        return typeof value === "bigint" ? { value, token: this.targetNativeToken, params: undefined } : undefined;
      }
    } else if (messageChannel === "msgline") {
      if (this.targetNativeToken && this.sourceChain && this.targetChain && this.contract) {
        const message = encodeFunctionData({
          abi: (await import("../abi/lnbridge-v3")).default,
          functionName: "withdrawLiquidity",
          args: [transferIds, BigInt(this.targetChain.id), relayer],
        });
        const feeAndParams = await this._getMsglineFeeAndParams(
          message,
          relayer,
          this.targetChain,
          this.sourceChain,
          this.contract.targetAddress,
          this.contract.sourceAddress,
        );
        return feeAndParams
          ? { value: feeAndParams.fee, token: this.targetNativeToken, params: feeAndParams.extParams }
          : undefined;
      }
    }
  }

  async requestWithdrawLiquidity(relayer: Address, transferIds: Hex[], messageFee: bigint, extParams: Hex) {
    await this.validateNetwork("target");

    if (this.contract && this.sourceChain && this.publicClient && this.walletClient) {
      const remoteChainId = BigInt(this.sourceChain.id);

      const hash = await this.walletClient.writeContract({
        address: this.contract.targetAddress,
        abi: (await import("../abi/lnbridge-v3")).default,
        functionName: "requestWithdrawLiquidity",
        args: [remoteChainId, transferIds, relayer, extParams],
        value: messageFee,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }
}
