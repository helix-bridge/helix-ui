import { ChainConfig, ChainID } from "@/types/chain";

export const bscChain: ChainConfig = {
  id: ChainID.BSC,
  network: "bsc",
  name: "BSC",
  logo: "bsc.svg",
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
  ],
};
