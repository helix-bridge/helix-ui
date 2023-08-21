export type TokenSymbol = "ETH" | "RING" | "USDC" | "USDT";

export interface Token {
  decimals: 18;
  symbol: TokenSymbol; // Also used as id
  name: string;
}
