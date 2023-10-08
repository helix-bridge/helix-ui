import { ChainConfig, ChainID } from "@/types/chain";

export const lineaGoerliChain: ChainConfig = {
  id: ChainID.LINEA_GOERLI,
  network: "linea-goerli",
  name: "Linea Goerli",
  logo: "linea.png",
  nativeCurrency: {
    name: "lineaETH",
    symbol: "lineaETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.goerli.linea.build"],
      webSocket: ["wss://rpc.goerli.linea.build"],
    },
    public: {
      http: ["https://rpc.goerli.linea.build"],
      webSocket: ["wss://rpc.goerli.linea.build"],
    },
  },
  blockExplorers: {
    default: {
      name: "BlockScout",
      url: "https://explorer.goerli.linea.build/",
    },
  },
  testnet: true,
  tokens: [
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xb5E028f980dF5533cB0e8F04530B76637383d993",
      logo: "usdc.svg",
      cross: [
        { target: { network: "goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-opposite" } },
        { target: { network: "arbitrum-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "mantle-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xBC1A2f123Dc9CD2ec8d3cE42eF16c28F3C9bA686",
      logo: "usdt.svg",
      cross: [
        { target: { network: "goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-opposite" } },
        { target: { network: "arbitrum-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "mantle-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
