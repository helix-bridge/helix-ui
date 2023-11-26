import { Address, TransactionReceipt, bytesToHex } from "viem";
import { LnBridgeBase } from "./lnbridge-base";
import { ChainID } from "@/types/chain";
import { isProduction } from "@/utils/env";
import { BridgeConstructorArgs, TransferOptions } from "@/types/bridge";

export class LnBridgeDefault extends LnBridgeBase {
  constructor(args: BridgeConstructorArgs) {
    super(args);
    this.initContract();
  }

  private initContract() {
    if (this.sourceChain?.id === ChainID.LINEA_GOERLI && this.targetChain?.id === ChainID.GOERLI) {
      this.contract = {
        sourceAddress: "0x4C538EfA6e3f9Dfb939AA4F0B224577DA665923a",
        targetAddress: "0x4C538EfA6e3f9Dfb939AA4F0B224577DA665923a",
      };
    } else if (this.sourceChain?.id === ChainID.ZKSYNC_GOERLI) {
      this.contract = {
        sourceAddress: "0xe8d55759c32fb608fD092aB2C0ef8A1F52B254d4",
        targetAddress: "0x7e101911E5FB461d78FBde3992f76F3Bf8BbA829",
      };
    } else if (this.targetChain?.id === ChainID.ZKSYNC_GOERLI) {
      this.contract = {
        sourceAddress: "0x7e101911E5FB461d78FBde3992f76F3Bf8BbA829",
        targetAddress: "0xe8d55759c32fb608fD092aB2C0ef8A1F52B254d4",
      };
    } else if (this.sourceChain?.id === ChainID.ZKSYNC) {
      this.contract = {
        sourceAddress: "0x767Bc046c989f5e63683fB530f939DD34b91ceAC",
        targetAddress: "0x94C614DAeFDbf151E1BB53d6A201ae5fF56A9337",
      };
    } else if (this.targetChain?.id === ChainID.ZKSYNC) {
      this.contract = {
        sourceAddress: "0x94C614DAeFDbf151E1BB53d6A201ae5fF56A9337",
        targetAddress: "0x767Bc046c989f5e63683fB530f939DD34b91ceAC",
      };
    } else if (isProduction()) {
      this.contract = {
        sourceAddress: "0x94C614DAeFDbf151E1BB53d6A201ae5fF56A9337",
        targetAddress: "0x94C614DAeFDbf151E1BB53d6A201ae5fF56A9337",
      };
    } else {
      this.contract = {
        sourceAddress: "0x7e101911E5FB461d78FBde3992f76F3Bf8BbA829",
        targetAddress: "0x7e101911E5FB461d78FBde3992f76F3Bf8BbA829",
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
        abi: (await import(`../abi/lnbridgev20-default`)).default,
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
        abi: (await import(`../abi/lnbridgev20-default`)).default,
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
        abi: (await import(`../abi/lnbridgev20-default`)).default,
        functionName: "setProviderFee",
        args: [BigInt(this.targetChain.id), this.sourceToken.address, this.targetToken.address, baseFee, feeRate],
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }

  async getWithdrawFee() {
    if (this.contract && this.sourceNativeToken && this.targetChain && this.sourcePublicClient) {
      const bridgeAbi = (await import(`../abi/lnbridgev20-default`)).default;
      const accessAbi = (await import(`../abi/lnaccess-controller`)).default;
      const remoteChainId = BigInt(this.targetChain.id);

      const [sendService, _receiveService] = await this.sourcePublicClient.readContract({
        address: this.contract.sourceAddress,
        abi: bridgeAbi,
        functionName: "messagers",
        args: [remoteChainId],
      });
      const [nativeFee, _zroFee] = await this.sourcePublicClient.readContract({
        address: sendService,
        abi: accessAbi,
        functionName: "fee",
        args: [remoteChainId, bytesToHex(Uint8Array.from([123]), { size: 500 })],
      });

      return { value: nativeFee, token: this.sourceNativeToken };
    }
  }

  async withdrawMargin(recipient: Address, amount: bigint, fee: bigint) {
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
        abi: (await import(`../abi/lnbridgev20-default`)).default,
        functionName: "requestWithdrawMargin",
        args: [remoteChainId, this.sourceToken.address, this.targetToken.address, amount, recipient],
        gas: this.getTxGasLimit(),
        value: fee,
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }
}
