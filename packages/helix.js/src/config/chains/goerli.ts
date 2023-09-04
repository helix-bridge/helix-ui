import { ChainConfig, ChainID } from "../../types";

export const goerliChain: ChainConfig = {
  id: ChainID.GOERLI,
  network: "goerli",
  name: "Goerli",
  tokens: [
    {
      decimals: 18,
      symbol: "GoerliETH",
      name: "GoerliETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
    },
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x1836bafa3016dd5ce543d0f7199cb858ec69f41e",
    },
  ],
  crossChain: {
    "arbitrum-goerli": {
      "lnbridgev20-default": {
        bridgeContract: {
          sourceAddress: "0xcD86cf37a4Dc6f78B4899232E7dD1b5c8130EFDA",
          targetAddress: "0x",
        },
        tokens: [{ sourceToken: "RING", targetToken: "RING" }],
      },
    },
  },
};
