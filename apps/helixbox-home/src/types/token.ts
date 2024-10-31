import { Address } from "viem";
import { CrossChain } from "./cross-chain";

export type TokenCategory = string | "others";

export type TokenSymbol = string;

export type TokenType = "native" | "erc20";

export interface Token {
  decimals: number;
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
