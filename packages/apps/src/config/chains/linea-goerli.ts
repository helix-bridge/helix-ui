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
      decimals: 18,
      symbol: "lineaETH",
      name: "lineaETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.svg",
      cross: [
        { target: { network: "goerli", symbol: "ETH" }, bridge: { category: "lnbridgev20-opposite" } },
        { target: { network: "arbitrum-goerli", symbol: "ETH" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync-goerli", symbol: "zkETH" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xeC89AF5FF618bbF667755BE9d63C69F21F1c00C8",
      logo: "usdc.svg",
      cross: [
        { target: { network: "goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-opposite" } },
        { target: { network: "arbitrum-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "mantle-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x8f3663930211f3DE17619FEB2eeB44c9c3F44a06",
      logo: "usdt.svg",
      cross: [
        { target: { network: "goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-opposite" } },
        { target: { network: "arbitrum-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "mantle-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
