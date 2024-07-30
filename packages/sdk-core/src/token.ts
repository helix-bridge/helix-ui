import { Address } from "viem";

const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

export class Token {
  private readonly chainId: number;
  readonly address: Address;
  readonly decimals: number;
  readonly symbol: string;
  readonly name: string;
  constructor(chainId: number, address: Address, decimals: number, symbol: string, name: string) {
    this.chainId = chainId;
    this.address = address;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
  }

  get isNative() {
    return this.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase();
  }

  getChainId() {
    return this.chainId;
  }

  isEqual(token: Token) {
    return this.chainId === token.getChainId() && this.address.toLowerCase() === token.address.toLowerCase();
  }
}
