import { ChainConfig, ChainID } from "@/types/chain";

export const lineaChain: ChainConfig = {
  id: ChainID.LINEA,
  network: "linea",
  name: "Linea",
  logo: "linea.png",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.linea.build"],
      webSocket: ["wss://rpc.linea.build"],
    },
    public: {
      http: ["https://rpc.linea.build"],
      webSocket: ["wss://rpc.linea.build"],
    },
  },
  blockExplorers: {
    default: {
      name: "BlockScout",
      url: "https://explorer.linea.build/",
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
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xA219439258ca9da29E9Cc4cE5596924745e12B93",
      logo: "usdt.svg",
      cross: [
        { target: { network: "arbitrum", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "bsc", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
