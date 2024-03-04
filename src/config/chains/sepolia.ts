import { ChainConfig } from "@/types";
import { sepolia } from "viem/chains";

export const sepoliaChain: ChainConfig = {
  /**
   * Chain
   */
  ...sepolia,
  network: "sepolia",
  name: "Sepolia",
  rpcUrls: {
    default: {
      http: ["https://1rpc.io/sepolia"],
      webSocket: ["wss://ethereum-sepolia.publicnode.com"],
    },
    public: {
      http: ["https://1rpc.io/sepolia"],
      webSocket: ["wss://ethereum-sepolia.publicnode.com"],
    },
  },

  /**
   * Custom
   */
  logo: "sepolia.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.svg",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x0ac58Df0cc3542beC4cDa71B16D06C3cCc39f405",
      logo: "usdc.svg",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x876A4f6eCF13EEb101F9E75FCeF58f19Ff383eEB",
      logo: "usdt.png",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "xCRAB",
      name: "xCRAB",
      type: "erc20",
      address: "0x9Da7E18441f26515CC713290BE846E726d41781d",
      logo: "crab.svg",
      cross: [
        // { target: { network: "crab-dvm", symbol: "CRAB" }, bridge: { category: "xtoken-sepolia" }, action: "redeem" },
      ],
    },
    {
      decimals: 18,
      symbol: "xPRING",
      name: "xPRING",
      type: "erc20",
      address: "0xBC43cb6175FcC8E577a0846256eA699b87eFcEE5",
      logo: "ring.svg",
      cross: [
        {
          target: { network: "pangolin-dvm", symbol: "PRING" },
          bridge: { category: "xtoken-sepolia" },
          action: "redeem",
        },
      ],
    },
  ],
  messager: {
    msgline: "0xf7F461728DC89de5EF6615715678b5f5b12bb98A",
  },
};
