import type { Address, Chain } from "wagmi";
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
  POLYGON_ZKEVM = 1101,

  LINEA = 59144,
  MANTLE = 5000,
  BASE = 8453,
  SCROLL = 534352,
  BSC = 56,
  OPTIMISM = 10,
  GNOSIS = 100,
  BLAST = 81457,
  BERA = 80085,
  TAIKO = 167008,
  TAIKO_HEKLA = 167009,
  ASTAR_ZKEVM = 3776,
  MORPH = 2710,
  MOONBEAM = 1284,
}

// According to graphql indexer
export type Network =
  | "darwinia-dvm"
  | "crab-dvm"
  | "pangolin-dvm"
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
  | "op"
  | "blast"
  | "bera"
  | "taiko"
  | "taiko-hekla"
  | "morph"
  | "moonbeam"
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
  messager?: { msgline?: Address };
  hidden?: boolean;
}
