import { ChainConfig, ChainID } from "@/types/chain";

export const scrollChain: ChainConfig = {
  id: ChainID.SCROLL,
  network: "scroll",
  name: "Scroll",
  logo: "scroll.png",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.scroll.io"],
      webSocket: [],
    },
    public: {
      http: ["https://rpc.scroll.io"],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: {
      name: "Scrollscan",
      url: "https://scrollscan.com",
    },
  },
  tokens: [
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df",
      logo: "usdt.svg",
      cross: [
        { target: { network: "mantle", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
