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
      cross: [],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xBAD026e314a77e727dF643B02f63adA573a3757c",
      logo: "usdc.svg",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x543bf1AC41485dc78039b9351563E4Dd13A288cb",
      logo: "usdt.png",
      cross: [],
    },
  ],
  hidden: true,
};
