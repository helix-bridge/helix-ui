export enum TokenSymbol {
  ETH = "ETH",
  RING = "RING",
  USDC = "USDC",
  USDT = "USDT",
}

export interface Token {
  decimals: 18;
  symbol: TokenSymbol; // Also used as id
  name: string;
}
