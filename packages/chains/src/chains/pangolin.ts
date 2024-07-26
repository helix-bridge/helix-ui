import { Chain, ChainID } from "../types";

export const pangolin: Chain = {
  /**
   * Viem Chain
   */
  id: ChainID.PANGOLIN,
  name: "Pangolin",
  nativeCurrency: {
    name: "PRING",
    symbol: "PRING",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://pangolin-rpc.darwinia.network"],
      webSocket: ["wss://pangolin-rpc.darwinia.network"],
    },
    public: {
      http: ["https://pangolin-rpc.darwinia.network"],
      webSocket: ["wss://pangolin-rpc.darwinia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://pangolin.subscan.io/",
    },
  },
  testnet: true,

  /**
   * Custom
   */
  network: "pangolin-dvm",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/pangolin.png",
};
