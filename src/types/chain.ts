import type { Address, Chain } from "wagmi";
import { Token } from "./token";

export enum ChainID {
  DARWINIA = 46,
  CRAB = 44,
  PANGOLIN = 43,
  PANGORO = 45,

  ETHEREUM = 1,
  GOERLI = 5,
  SEPOLIA = 11155111,

  ARBITRUM = 42161,
  ARBITRUM_GOERLI = 421613,
  ARBITRUM_SEPOLIA = 421614,

  ZKSYNC = 324,
  ZKSYNC_GOERLI = 280,
  ZKSYNC_SEPOLIA = 300,

  LINEA = 59144,
  LINEA_GOERLI = 59140,

  MANTLE = 5000,
  MANTLE_GOERLI = 5001,

  MUMBAI = 80001,
  POLYGON = 137,
  POLYGON_ZKEVM = 1101,

  BASE = 8453,
  BASE_GOERLI = 84531,

  SCROLL = 534352,
  BSC = 56,
  OPTIMISM = 10,
  GNOSIS = 100,

  BLAST = 81457,
}

// According to graphql indexer
export type Network =
  | "darwinia-dvm"
  | "crab-dvm"
  | "pangolin-dvm"
  | "pangoro-dvm"
  | "ethereum"
  | "goerli"
  | "sepolia"
  | "arbitrum"
  | "arbitrum-goerli"
  | "arbitrum-sepolia"
  | "zksync"
  | "zksync-goerli"
  | "zksync-sepolia"
  | "linea"
  | "linea-goerli"
  | "mantle"
  | "mantle-goerli"
  | "polygon"
  | "polygon-zkEvm"
  | "gnosis"
  | "mumbai"
  | "scroll"
  | "base-goerli"
  | "base"
  | "op"
  | "blast"
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
