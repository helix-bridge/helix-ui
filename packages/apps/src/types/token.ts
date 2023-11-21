import { Address } from "viem";

export type TokenSymbol =
  | "ETH"
  | "RING"
  | "USDC"
  | "USDT"
  | "PRING"
  | "ORING"
  | "CRAB"
  | "KTON"
  | "WRING"
  | "xWRING"
  | "xWCRAB"
  | "MNT"
  | "MATIC"
  | "BNB";

export type TokenType = "native" | "erc20" | "mapping";

export interface Token {
  decimals: 18 | 6;
  symbol: TokenSymbol; // Also used as id
  name: string;
  type: TokenType;
  address: Address;
  logo: string; // File name
}
