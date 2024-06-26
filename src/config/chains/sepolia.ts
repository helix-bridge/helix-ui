import { ChainConfig } from "../../types";
import { sepolia } from "viem/chains";

export const sepoliaChain: ChainConfig = {
  /**
   * Chain
   */
  ...sepolia,
  network: "sepolia",
  name: "Sepolia",

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
      logo: "eth.png",
      cross: [
        {
          target: { network: "arbitrum-sepolia", symbol: "ETH" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
        },
        { target: { network: "zksync-sepolia", symbol: "ETH" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
      category: "eth",
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x0ac58Df0cc3542beC4cDa71B16D06C3cCc39f405",
      logo: "usdc.png",
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
      category: "usdc",
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
      category: "usdt",
    },
    {
      decimals: 18,
      symbol: "xCRAB",
      name: "xCRAB",
      type: "erc20",
      address: "0x9Da7E18441f26515CC713290BE846E726d41781d",
      logo: "crab.png",
      cross: [],
      category: "others",
    },
    {
      decimals: 18,
      symbol: "xPRING",
      name: "xPRING",
      type: "erc20",
      address: "0xBC43cb6175FcC8E577a0846256eA699b87eFcEE5",
      logo: "ring.png",
      cross: [],
      category: "ring",
    },
  ],
  messager: {
    msgline: "0xf7F461728DC89de5EF6615715678b5f5b12bb98A",
  },
};
