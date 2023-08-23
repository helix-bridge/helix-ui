export type TokenSymbol = "ETH" | "GoerliETH" | "RING" | "USDC" | "USDT";

export interface Token {
  decimals: 18 | 6;
  symbol: TokenSymbol; // Also used as id
  name: string;
  type: "native" | "erc20";
  address: `0x${string}`;
}
