import { ChainConfig, ChainID } from "@/types/chain";

export const zksyncGoerliChain: ChainConfig = {
  id: ChainID.ZKSYNC_GOERLI,
  network: "zksync-goerli",
  name: "Zksync Era Testnet",
  logo: "zksync.png",
  nativeCurrency: {
    name: "zkETH",
    symbol: "zkETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.era.zksync.dev"],
      webSocket: ["wss://testnet.era.zksync.dev/ws"],
    },
    public: {
      http: ["https://testnet.era.zksync.dev"],
      webSocket: ["wss://testnet.era.zksync.dev/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Zksync",
      url: "https://goerli.explorer.zksync.io/",
    },
  },
  testnet: true,
  tokens: [],
};
