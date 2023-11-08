import { ChainConfig, ChainID } from "@/types/chain";

export const mantleChain: ChainConfig = {
  id: ChainID.MANTLE,
  network: "mantle",
  name: "Mantle",
  logo: "mantle.svg",
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
  tokens: [
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE",
      logo: "usdt.svg",
      cross: [
        { target: { network: "arbitrum", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "scroll", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
