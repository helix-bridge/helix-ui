import { ChainConfig, ChainID } from "@/types/chain";

export const optimismChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.OPTIMISM,
  network: "op",
  name: "OP Mainnet",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.optimism.io"],
      webSocket: ["wss://optimism.publicnode.com"],
    },
    public: {
      http: ["https://mainnet.optimism.io"],
      webSocket: ["wss://optimism.publicnode.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://optimistic.etherscan.io/",
    },
  },

  /**
   * Custom
   */
  logo: "optimism.png",
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
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      logo: "usdt.png",
      cross: [{ target: { network: "bsc", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } }],
    },
  ],
};
