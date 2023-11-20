import type { Chain } from "wagmi";
import { Token } from "./token";

export enum ChainID {
  DARWINIA = 46,
  CRAB = 44,
  PANGOLIN = 43,
  PANGORO = 45,

  ETHEREUM = 1,
  GOERLI = 5,

  ARBITRUM = 42161,
  ARBITRUM_GOERLI = 421613,

  ZKSYNC = 324,
  ZKSYNC_GOERLI = 280,

  LINEA = 59144,
  LINEA_GOERLI = 59140,

  MANTLE = 5000,
  MANTLE_GOERLI = 5001,

  MUMBAI = 80001,
  POLYGON = 137,

  SCROLL = 534352,

  BASE = 8453,
  BASE_GOERLI = 84531,
}

// According to graphql indexer
export type Network =
  | "darwinia-dvm"
  | "crab-dvm"
  | "pangolin-dvm"
  | "pangoro-dvm"
  | "ethereum"
  | "goerli"
  | "arbitrum"
  | "arbitrum-goerli"
  | "zksync"
  | "zksync-goerli"
  | "linea"
  | "linea-goerli"
  | "mantle"
  | "mantle-goerli"
  | "polygon"
  | "mumbai"
  | "scroll"
  | "base-goerli"
  | "base";

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
