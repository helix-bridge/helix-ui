import { ChainConfig, ChainID } from "@/types/chain";

export const ethereumChain: ChainConfig = {
  id: ChainID.ETHEREUM,
  network: "ethereum",
  name: "Ethereum",
  logo: "ethereum.png",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.infura.io/v3/5350449ccd2349afa007061e62ee1409"],
      webSocket: ["wss://mainnet.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409"],
    },
    public: {
      http: ["https://mainnet.infura.io/v3/5350449ccd2349afa007061e62ee1409"],
      webSocket: ["wss://mainnet.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://etherscan.io/",
    },
  },
  tokens: [],
};
