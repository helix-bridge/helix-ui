import { ChainConfig, ChainID } from "@/types/chain";

export const scrollChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.SCROLL,
  network: "scroll",
  name: "Scroll",
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

  /**
   * Custom
   */
  logo: "scroll.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.svg",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df",
      logo: "usdt.png",
      cross: [
        { target: { network: "mantle", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
      logo: "usdc.svg",
      cross: [
        { target: { network: "mantle", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "arbitrum", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
