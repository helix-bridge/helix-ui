import { ChainConfig, ChainID } from "@/types/chain";

export const goerliChain: ChainConfig = {
  id: ChainID.GOERLI,
  network: "goerli",
  name: "Goerli",
  logo: "ethereum.png",
  nativeCurrency: {
    name: "goerliETH",
    symbol: "goerliETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://goerli.infura.io/v3/5350449ccd2349afa007061e62ee1409"],
      webSocket: ["wss://goerli.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409"],
    },
    public: {
      http: ["https://goerli.infura.io/v3/5350449ccd2349afa007061e62ee1409"],
      webSocket: ["wss://goerli.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://goerli.etherscan.io/",
    },
  },
  testnet: true,
  tokens: [
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x1a70127284B774fF4A4dbfe0115114642f0eca65",
      logo: "usdc.svg",
      cross: [
        { target: { network: "arbitrum-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "linea-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "mantle-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x2303e4d55BF16a897Cb5Ab71c6225399509d9314",
      logo: "usdt.svg",
      cross: [
        { target: { network: "arbitrum-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "linea-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "mantle-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 18,
      symbol: "PRING",
      name: "PRING",
      type: "erc20",
      address: "0xeb93165E3CDb354c977A182AbF4fad3238E04319",
      logo: "ring.svg",
      cross: [],
    },
  ],
};
