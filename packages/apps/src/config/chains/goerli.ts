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
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.svg",
      cross: [
        { target: { network: "arbitrum-goerli", symbol: "ETH" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "linea-goerli", symbol: "ETH" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync-goerli", symbol: "ETH" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xe9784E0d9A939dbe966b021DE3cd877284DB1B99",
      logo: "usdc.svg",
      cross: [
        { target: { network: "arbitrum-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "linea-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "mantle-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xa39cffE89567eBfb5c306a07dfb6e5B3ba41F358",
      logo: "usdt.svg",
      cross: [
        { target: { network: "arbitrum-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "linea-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "mantle-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "base-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 18,
      symbol: "MNT",
      name: "MNT",
      type: "erc20",
      address: "0xc1dc2d65a2243c22344e725677a3e3bebd26e604",
      logo: "mnt.svg",
      cross: [{ target: { network: "mantle-goerli", symbol: "MNT" }, bridge: { category: "lnbridgev20-default" } }],
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
