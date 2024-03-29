import { Address } from "viem";
import { CrossChain } from "./cross-chain";

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
  | "xCRAB"
  | "xWRING"
  | "xWCRAB"
  | "xPRING"
  | "MNT"
  | "MATIC"
  | "BNB"
  | "xDai";

export type TokenType = "native" | "erc20" | "mapping";

export interface Token {
  decimals: 18 | 6;
  symbol: TokenSymbol; // Also used as id
  name: string;
  type: TokenType;
  address: Address;
  outer: Address; // User-oriented, convertor
  inner: Address; // Bridge-oriented
  logo: string; // File name
  cross: CrossChain[];
}
