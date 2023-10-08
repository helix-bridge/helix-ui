import { Address } from "viem";

export type TokenSymbol =
  | "ETH"
  | "GoerliETH"
  | "lineaETH"
  | "RING"
  | "USDC"
  | "USDT"
  | "PRING"
  | "ORING"
  | "CRAB"
  | "KTON"
  | "xWRING"
  | "xWCRAB";

export type TokenType = "native" | "erc20" | "mapping";

export interface Token {
  decimals: 18 | 6;
  symbol: TokenSymbol; // Also used as id
  name: string;
  type: TokenType;
  address: Address;
  logo: string; // File name
}
