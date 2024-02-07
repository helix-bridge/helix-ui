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
      cross: [
        {
          target: { network: "arbitrum-sepolia", symbol: "ETH" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
        },
        { target: { network: "zksync-sepolia", symbol: "ETH" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x0ac58Df0cc3542beC4cDa71B16D06C3cCc39f405",
      logo: "usdc.svg",
      cross: [
        {
          target: { network: "arbitrum-sepolia", symbol: "USDC" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
        },
        {
          target: { network: "zksync-sepolia", symbol: "USDC" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
        },
      ],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x876A4f6eCF13EEb101F9E75FCeF58f19Ff383eEB",
      logo: "usdt.png",
      cross: [
        {
          target: { network: "arbitrum-sepolia", symbol: "USDT" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
        },
        {
          target: { network: "zksync-sepolia", symbol: "USDT" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
        },
      ],
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
    msgline: "0xc876D0873e4060472334E297b2db200Ca10cc806",
  },
};
