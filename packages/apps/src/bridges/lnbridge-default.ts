import { TransactionReceipt } from "viem";
import { LnBridgeBase } from "./lnbridge-base";
import { ChainConfig, ChainID } from "@/types/chain";
import { Token } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";
import { isProduction } from "@/utils/env";
import { BridgeCategory, BridgeLogo } from "@/types/bridge";

export class LnBridgeDefault extends LnBridgeBase {
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
  }

  private initContract() {
    if (this.sourceChain?.id === ChainID.LINEA_GOERLI && this.targetChain?.id === ChainID.GOERLI) {
      // Linea Goerli => Goerli
      this.contract = {
        sourceAddress: "0x4C538EfA6e3f9Dfb939AA4F0B224577DA665923a",
        targetAddress: "0x4C538EfA6e3f9Dfb939AA4F0B224577DA665923a",
      };
    } else if (this.sourceChain?.id === ChainID.ZKSYNC_GOERLI) {
      // zkSync Goerli => *
      this.contract = {
        sourceAddress: "0xe8d55759c32fb608fD092aB2C0ef8A1F52B254d4",
        targetAddress: "0x7e101911E5FB461d78FBde3992f76F3Bf8BbA829",
      };
    } else if (this.targetChain?.id === ChainID.ZKSYNC_GOERLI) {
      // * => zkSync Goerli
      this.contract = {
        sourceAddress: "0x7e101911E5FB461d78FBde3992f76F3Bf8BbA829",
        targetAddress: "0xe8d55759c32fb608fD092aB2C0ef8A1F52B254d4",
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

  async transfer(
    _: string,
    recipient: string,
    amount: bigint,
    options: {
      remoteChainId: bigint;
      relayer: string;
      sourceToken: string;
      targetToken: string;
      transferId: string;
      totalFee: bigint;
      withdrawNonce: bigint;
    },
  ): Promise<TransactionReceipt | undefined> {
    await this.validateNetwork("source");

    if (this.contract && this.sourceToken && this.publicClient && this.walletClient) {
      const abi = (await import(`../abi/lnbridgev20-default.json`)).default;
      const snapshot = [
        options.remoteChainId,
        options.relayer,
        options.sourceToken,
        options.targetToken,
        options.transferId,
        options.totalFee,
        options.withdrawNonce,
      ];

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi,
        functionName: "transferAndLockMargin",
        args: [snapshot, amount, recipient],
        value: this.sourceToken.type === "native" ? amount + options.totalFee : undefined,
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
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
      const abi = (await import(`../abi/lnbridgev20-default.json`)).default;

      const hash = await this.walletClient.writeContract({
        address: this.contract.targetAddress,
        abi,
        functionName: "depositProviderMargin",
        args: [BigInt(this.sourceChain.id), this.sourceToken.address, this.targetToken.address, margin],
        value: this.sourceToken.type === "native" ? margin : undefined,
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
      const abi = (await import(`../abi/lnbridgev20-default.json`)).default;

      const hash = await this.walletClient.writeContract({
        address: this.contract.sourceAddress,
        abi,
        functionName: "setProviderFee",
        args: [BigInt(this.targetChain.id), this.sourceToken.address, this.targetToken.address, baseFee, feeRate],
        gas: this.getTxGasLimit(),
      });
      return this.publicClient.waitForTransactionReceipt({ hash });
    }
  }
}
