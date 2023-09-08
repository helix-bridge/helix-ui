export type TokenSymbol = "ETH" | "GoerliETH" | "RING" | "USDC" | "USDT" | "USD//C";

export interface Token {
  decimals: 18 | 6;
  symbol: TokenSymbol; // Also used as id
  name: string;
  type: "native" | "erc20";
  address: `0x${string}`;
}
