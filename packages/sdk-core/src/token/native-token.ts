import { Address, PublicClient, WalletClient, zeroAddress } from "viem";
import { Token } from "./token";
import assert from "assert";

interface Options {
  logo?: string;
  publicClient?: PublicClient;
  walletClient?: WalletClient;
}

export class NativeToken extends Token {
  private readonly publicClient?: PublicClient;
  private readonly walletClient?: WalletClient;

  constructor(chainId: number, address: Address, decimals: number, symbol: string, name: string, options?: Options) {
    super(chainId, address, decimals, symbol, name, options?.logo);
    assert(address === zeroAddress, "Native token address must be zero address");
    this.publicClient = options?.publicClient;
    this.walletClient = options?.walletClient;
  }

  getBalance(address: Address) {
    return this.publicClient?.getBalance({ address });
  }

  getAllowance(owner: Address, spender: Address) {
    void owner, spender;
    return Promise.resolve(this.parseEther(Number.MAX_SAFE_INTEGER.toString()));
  }
}
