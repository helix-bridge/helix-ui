import { ChainConfig } from "@/types/chain";
import { arbitrum } from "viem/chains";

export const arbitrumChain: ChainConfig = {
  /**
   * Chain
   */
  ...arbitrum,
  network: "arbitrum",
  name: "Arbitrum One",

  /**
   * Custom
   */
  logo: "arbitrum.png",
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
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x9e523234D36973f9e38642886197D023C88e307e",
      logo: "ring.svg",
      cross: [
        { target: { network: "ethereum", symbol: "RING" }, bridge: { category: "lnbridge", lnv2Type: "opposite" } },
        { target: { network: "darwinia-dvm", symbol: "RING" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "polygon", symbol: "RING" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      logo: "usdt.png",
      cross: [
        { target: { network: "mantle", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "zksync", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "bsc", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "linea", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "polygon", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "op", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "gnosis", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "scroll", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
    },
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      logo: "usdc.svg",
      cross: [
        { target: { network: "mantle", symbol: "USDC" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "scroll", symbol: "USDC" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
    },
  ],
  messager: { msgline: "0x3d33856dcf74f110690f5a2647c7dfb9bb5ff2d0" },
};
