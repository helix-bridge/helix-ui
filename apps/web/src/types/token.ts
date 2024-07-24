import { Address } from "viem";
import { CrossChain } from "./cross-chain";

export type TokenCategory = "ring" | "crab" | "eth" | "usdt" | "usdc" | "pink" | "others";

export type TokenSymbol =
  | "ETH"
  | "RING"
  | "USDC"
  | "USDT"
  | "xcUSDT"
  | "ahUSDT"
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
  | "PINK"
  | "xcPINK"
  | "ahPINK"
  | "xDai";

export type TokenType = "native" | "erc20";

export interface Token {
  decimals: 18 | 10 | 6;
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
