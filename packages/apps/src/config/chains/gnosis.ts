import { ChainConfig, ChainID } from "@/types";

export const gnosisChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.GNOSIS,
  network: "gnosis",
  name: "Gnosis Chain",
  nativeCurrency: {
    name: "xDai",
    symbol: "xDai",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.gnosischain.com/"],
      webSocket: [],
    },
    public: {
      http: ["https://rpc.gnosischain.com/"],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: {
      name: "GnosisScan",
      url: "https://gnosisscan.io/",
    },
  },

  /**
   * Custom
   */
  logo: "gnosis.png",
  tokens: [
    {
      decimals: 18,
      symbol: "xDai",
      name: "xDai",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "xdai.svg",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x4ECaBa5870353805a9F068101A40E0f32ed605C6",
      logo: "usdt.png",
      cross: [{ target: { network: "bsc", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } }],
    },
  ],
};
