import type { Chain as ViemChain } from "viem";

/* eslint-disable no-unused-vars */
export enum ChainID {
  DARWINIA = 46,
  CRAB = 44,

  ETHEREUM = 1,
  SEPOLIA = 11155111,

  ARBITRUM = 42161,
  ARBITRUM_SEPOLIA = 421614,

  ZKSYNC = 324,
  ZKSYNC_SEPOLIA = 300,

  POLYGON = 137,
  POLYGON_ZKEVM = 1101,

  LINEA = 59144,
  MANTLE = 5000,
  BASE = 8453,
  BASE_SEPOLIA = 84532,
  SCROLL = 534352,
  BSC = 56,
  OPTIMISM = 10,
  GNOSIS = 100,
  BLAST = 81457,
  BERA = 80084,
  TAIKO_HEKLA = 167009,
  ASTAR_ZKEVM = 3776,
  MORPH = 2818,
  MORPH_TESTNET = 2810,
  MOONBEAM = 1284,
  AVALANCHE = 43_114,
  ZIRCUIT_SEPOLIA = 48899,
  ZIRCUIT = 48900,
  CELO_TESTNET = 44787,
}
/* eslint-enable no-unused-vars */

// According to graphql indexer
export type Network =
  | "darwinia-dvm"
  | "crab-dvm"
  | "ethereum"
  | "sepolia"
  | "arbitrum"
  | "arbitrum-sepolia"
  | "zksync"
  | "zksync-sepolia"
  | "linea"
  | "mantle"
  | "polygon"
  | "polygon-zkEvm"
  | "astar-zkevm"
  | "gnosis"
  | "scroll"
  | "base"
  | "base-sepolia"
  | "op"
  | "blast"
  | "bera"
  | "taiko-hekla"
  | "morph"
  | "morph-testnet"
  | "moonbeam"
  | "avalanche"
  | "bsc"
  | "zircuit"
  | "zircuit-sepolia"
  | "celo-testnet";

export interface Chain extends ViemChain {
  id: ChainID;
  network: Network;
  logo: string;
}
