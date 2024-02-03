import { ChainConfig } from "@/types";
import { gnosis } from "viem/chains";

export const gnosisChain: ChainConfig = {
  /**
   * Chain
   */
  ...gnosis,
  network: "gnosis",
  name: "Gnosis Chain",

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
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x4ECaBa5870353805a9F068101A40E0f32ed605C6",
      logo: "usdt.png",
      cross: [
        { target: { network: "bsc", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "polygon", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "linea", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "op", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "mantle", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "scroll", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "arbitrum", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
    },
  ],
};
