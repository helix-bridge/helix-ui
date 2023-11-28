import { ChainConfig, ChainID } from "@/types/chain";

export const bscChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.BSC,
  network: "bsc",
  name: "BSC",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://bsc-dataseed1.binance.org"],
      webSocket: ["wss://bsc.publicnode.com"],
    },
    public: {
      http: ["https://bsc-dataseed1.binance.org"],
      webSocket: ["wss://bsc.publicnode.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "BscScan",
      url: "https://bscscan.com/",
    },
  },

  /**
   * Custom
   */
  logo: "bsc.svg",
  tokens: [
    {
      decimals: 18,
      symbol: "BNB",
      name: "BNB",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "bnb.svg",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x55d398326f99059fF775485246999027B3197955",
      logo: "usdt.png",
      cross: [
        { target: { network: "arbitrum", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "op", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "linea", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      logo: "usdc.svg",
      cross: [{ target: { network: "base", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } }],
    },
  ],
};
