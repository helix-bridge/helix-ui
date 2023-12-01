import { ChainConfig, ChainID } from "@/types/chain";

export const mantleChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.MANTLE,
  network: "mantle",
  name: "Mantle",
  nativeCurrency: {
    name: "MNT",
    symbol: "MNT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.mantle.xyz"],
      webSocket: ["wss://rpc.mantle.xyz"],
    },
    public: {
      http: ["https://rpc.mantle.xyz"],
      webSocket: ["wss://rpc.mantle.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mantle",
      url: "https://explorer.mantle.xyz/",
    },
  },

  /**
   * Custom
   */
  logo: "mantle.svg",
  tokens: [
    {
      decimals: 18,
      symbol: "MNT",
      name: "MNT",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "mnt.svg",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE",
      logo: "usdt.png",
      cross: [
        { target: { network: "arbitrum", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "scroll", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9",
      logo: "usdc.svg",
      cross: [
        { target: { network: "arbitrum", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "scroll", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
