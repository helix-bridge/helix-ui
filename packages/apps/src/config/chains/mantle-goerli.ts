import { ChainConfig, ChainID } from "@/types/chain";

export const mantleGoerliChain: ChainConfig = {
  id: ChainID.MANTLE_GOERLI,
  network: "mantle-goerli",
  name: "Mantle Testnet",
  logo: "mantle.svg",
  nativeCurrency: {
    name: "MNT",
    symbol: "MNT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.mantle.xyz"],
      webSocket: ["wss://rpc.testnet.mantle.xyz"],
    },
    public: {
      http: ["https://rpc.testnet.mantle.xyz"],
      webSocket: ["wss://rpc.testnet.mantle.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mantle",
      url: "https://explorer.testnet.mantle.xyz/",
    },
  },
  testnet: true,
  tokens: [
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x0258Eb547bFEd540ed17843658C018569fe1E328",
      logo: "usdc.svg",
      cross: [
        { target: { network: "goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "arbitrum-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "linea-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x5F8D4232367759bCe5d9488D3ade77FCFF6B9b6B",
      logo: "usdt.svg",
      cross: [
        { target: { network: "goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "arbitrum-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "linea-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
