import { ChainConfig, ChainID } from "@/types";

export const arbitrumGoerliChain: ChainConfig = {
  id: ChainID.ARBITRUM_GOERLI,
  network: "arbitrum-goerli",
  name: "Arbitrum Goerli",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
    },
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0xfbad806bdf9cec2943be281fb355da05068de925",
    },
  ],
  crossChain: {
    goerli: {
      "lnbridgev20-opposite": {
        bridgeContract: {
          sourceAddress: "0x7B8413FA1c1033844ac813A2E6475E15FB0fb3BA",
          targetAddress: "0x",
        },
        tokens: [{ sourceToken: "RING", targetToken: "RING" }],
      },
    },
  },
};
