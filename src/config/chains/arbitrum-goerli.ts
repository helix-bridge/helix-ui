import { ChainConfig } from "@/types/chain";
import { arbitrumGoerli } from "viem/chains";

export const arbitrumGoerliChain: ChainConfig = {
  /**
   * Chain
   */
  ...arbitrumGoerli,
  network: "arbitrum-goerli",
  name: "Arbitrum Goerli",

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
      cross: [
        { target: { network: "goerli", symbol: "ETH" }, bridge: { category: "lnbridge", lnv2Type: "opposite" } },
        { target: { network: "linea-goerli", symbol: "ETH" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "zksync-goerli", symbol: "ETH" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
      category: "eth",
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xBAD026e314a77e727dF643B02f63adA573a3757c",
      logo: "usdc.svg",
      cross: [
        { target: { network: "goerli", symbol: "USDC" }, bridge: { category: "lnbridge", lnv2Type: "opposite" } },
        { target: { network: "linea-goerli", symbol: "USDC" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "mantle-goerli", symbol: "USDC" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "zksync-goerli", symbol: "USDC" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
      category: "usdc",
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x543bf1AC41485dc78039b9351563E4Dd13A288cb",
      logo: "usdt.png",
      cross: [
        { target: { network: "goerli", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "opposite" } },
        { target: { network: "linea-goerli", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "mantle-goerli", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "zksync-goerli", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
      category: "usdt",
    },
  ],
  hidden: true,
};
