import { ChainConfig, ChainID } from "@/types/chain";

export const optimismChain: ChainConfig = {
  id: ChainID.OPTIMISM,
  network: "op",
  name: "OP Mainnet",
  logo: "optimism.png",
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
      logo: "usdt.svg",
      cross: [{ target: { network: "bsc", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } }],
    },
  ],
};
