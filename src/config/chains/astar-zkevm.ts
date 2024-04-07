import { ChainConfig, ChainID } from "@/types/chain";

export const astarZkEvmChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.ASTAR_ZKEVM,
  network: "astar-zkEvm",
  name: "Astar zkEVM",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.astar-zkevm.gelato.digital"],
      webSocket: [],
    },
    public: {
      http: ["https://rpc.astar-zkevm.gelato.digital"],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://astar-zkevm.explorer.startale.com/",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 183817,
    },
  },

  /**
   * Custom
   */
  logo: "astar.png",
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
};
