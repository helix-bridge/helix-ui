import type { Chain } from "wagmi";
import { Token } from "./token";

export enum ChainID {
  DARWINIA = 46,
  CRAB = 44,
  PANGOLIN = 43,

  ETHEREUM = 1,
  SEPOLIA = 11155111,

  ARBITRUM = 42161,
  ARBITRUM_SEPOLIA = 421614,

  ZKSYNC = 324,
  ZKSYNC_SEPOLIA = 300,

  POLYGON = 137,

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
  MORPH = 2810,
  MOONBEAM = 1284,
  AVALANCHE = 43_114,
  ZIRCUIT = 48900,
  ZIRCUIT_SEPOLIA = 48899,
}

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
  | "moonbeam"
  | "avalanche"
  | "zircuit"
  | "zircuit-sepolia"
  | "bsc";

export interface ChainConfig extends Chain {
  /**
   * Chain
   */
  id: ChainID;
  network: Network;

  /**
   * Custom
   */
  logo: string; // File name
  tokens: Token[];
  hidden?: boolean;
}
