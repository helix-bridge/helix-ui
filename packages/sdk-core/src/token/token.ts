import { Address, formatUnits, parseUnits, zeroAddress } from "viem";

const DEFAULT_TOKEN_LOGO =
  "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/tokens/eth.png";

export class Token {
  readonly chainId: number;
  readonly address: Address;
  readonly decimals: number;
  readonly symbol: string;
  readonly name: string;
  readonly logo: string;

  constructor(chainId: number, address: Address, decimals: number, symbol: string, name: string, logo?: string) {
    this.chainId = chainId;
    this.address = address;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
    this.logo = logo ?? DEFAULT_TOKEN_LOGO;
  }

  get isNative() {
    return this.address.toLowerCase() === zeroAddress.toLowerCase();
  }

  isEqual(token: Token) {
    return this.chainId === token.chainId && this.address.toLowerCase() === token.address.toLowerCase();
  }

  formatEther(value: bigint) {
    return formatUnits(value, this.decimals);
  }

  parseEther(value: string) {
    return parseUnits(value, this.decimals);
  }
}
