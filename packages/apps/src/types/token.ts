export type TokenSymbol = "ETH" | "GoerliETH" | "lineaETH" | "RING" | "USDC" | "USDT" | "PRING" | "ORING";

export interface Token {
  decimals: 18 | 6;
  symbol: TokenSymbol; // Also used as id
  name: string;
  type: "native" | "erc20";
  address: `0x${string}`;
  logo: string; // file name
}
