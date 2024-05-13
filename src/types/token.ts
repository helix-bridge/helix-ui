import { Address } from "viem";
import { CrossChain } from "./cross-chain";

export type TokenCategory = "ring" | "crab" | "eth" | "usdt" | "usdc" | "others";

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
  | "BERA"
  | "xDai";

export type TokenType = "native" | "erc20";

export interface Token {
  decimals: 18 | 6;
  symbol: TokenSymbol; // Also used as id
  name: string;
  type: TokenType;
  address: Address;
  logo: string; // File name
  cross: CrossChain[];
  category: TokenCategory;
}

export interface TokenOption {
  logo: string;
  category: TokenCategory;
  symbol: TokenSymbol;
}
