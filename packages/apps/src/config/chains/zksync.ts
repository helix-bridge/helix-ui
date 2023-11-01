import { ChainConfig, ChainID } from "@/types/chain";

export const zksyncChain: ChainConfig = {
  id: ChainID.ZKSYNC,
  network: "zksync",
  name: "Zksync",
  logo: "zksync.png",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.era.zksync.io"],
      webSocket: ["wss://mainnet.era.zksync.io/ws"],
    },
    public: {
      http: ["https://mainnet.era.zksync.io"],
      webSocket: ["wss://mainnet.era.zksync.io/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Zksync",
      url: "https://explorer.zksync.io/",
    },
  },
  tokens: [
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C",
      logo: "usdt.svg",
      cross: [{ target: { network: "arbitrum", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } }],
    },
  ],
};
