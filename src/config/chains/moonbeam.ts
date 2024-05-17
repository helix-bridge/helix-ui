import { ChainConfig, ChainID } from "../../types";

export const moonbeamChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.MOONBEAM,
  network: "moonbeam",
  name: "Moonbeam",
  nativeCurrency: {
    name: "GLMR",
    symbol: "GLMR",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.api.moonbeam.network"],
    },
    public: {
      http: ["https://rpc.api.moonbeam.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://moonbeam.subscan.io/",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 609002,
    },
  },

  /**
   * Custom
   */
  logo: "moonbeam.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.png",
      cross: [],
      category: "eth",
    },
    {
      decimals: 6,
      symbol: "xcUSDT",
      name: "xcUSDT",
      type: "erc20",
      address: "0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d",
      logo: "usdt.png",
      cross: [
        {
          target: { network: "darwinia-dvm", symbol: "ahUSDT" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "usdt",
    },
    {
      decimals: 10,
      symbol: "xcPINK",
      name: "xcPINK",
      type: "erc20",
      address: "0xffffffff30478fafbe935e466da114e14fb3563d",
      logo: "pink.png",
      cross: [
        {
          target: { network: "darwinia-dvm", symbol: "ahPINK" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "pink",
    },
  ],
};
