import type { Chain } from "wagmi";
import { Token } from "./token";
import { CrossChain } from "./cross-chain";

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
  | "mantle-goerli";

export interface ChainConfig extends Chain {
  id: ChainID;
  network: Network;
  logo: string; // File name
  tokens: (Token & { cross: CrossChain[] })[];
  hidden?: boolean;
}
