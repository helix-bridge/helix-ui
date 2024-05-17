import { ChainConfig, ChainID } from "../../types";

export const blastChain: ChainConfig = {
  id: ChainID.BLAST,
  network: "blast",
  name: "Blast",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["https://rpc.blast.io"] },
    public: { http: ["https://rpc.blast.io"] },
  },
  blockExplorers: {
    default: { name: "Blastscan", url: "https://blastscan.io" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 212929,
    },
  },

  logo: "blast.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.png",
      cross: [
        {
          target: { network: "arbitrum", symbol: "ETH" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "eth",
    },
  ],
  messager: { msgline: "0x98982b1685a63596834a05C1288dA7fbF27d684E" },
};
