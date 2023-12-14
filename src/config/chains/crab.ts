import { ChainConfig, ChainID } from "@/types/chain";

export const crabChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.CRAB,
  network: "crab-dvm",
  name: "Crab",
  nativeCurrency: {
    name: "CRAB",
    symbol: "CRAB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://crab-rpc.darwinia.network"],
      webSocket: ["wss://crab-rpc.darwinia.network"],
    },
    public: {
      http: ["https://crab-rpc.darwinia.network"],
      webSocket: ["wss://crab-rpc.darwinia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://crab.subscan.io/",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 599936,
    },
  },

  /**
   * Custom
   */
  logo: "crab.svg",
  tokens: [
    {
      decimals: 18,
      symbol: "CRAB",
      name: "CRAB",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "crab.svg",
      cross: [
        { target: { network: "darwinia-dvm", symbol: "xWCRAB" }, bridge: { category: "lnbridgev20-default" } },
        {
          target: { network: "darwinia-dvm", symbol: "xWCRAB" },
          bridge: { category: "helix-sub2subv21(lock)" },
          action: "issue",
        },
        { target: { network: "sepolia", symbol: "xCRAB" }, bridge: { category: "xtoken-crab-dvm" } },
      ],
    },
    {
      decimals: 18,
      symbol: "xWRING",
      name: "xWRING",
      type: "erc20",
      address: "0x273131F7CB50ac002BDd08cA721988731F7e1092",
      logo: "ring.svg",
      cross: [
        { target: { network: "darwinia-dvm", symbol: "RING" }, bridge: { category: "lnbridgev20-default" } },
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "helix-sub2subv21(unlock)" },
          action: "redeem",
        },
      ],
    },
  ],
};
