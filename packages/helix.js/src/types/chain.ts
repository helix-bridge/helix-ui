export enum ChainID {
  ETHEREUM = 1,
  GOERLI = 5,
  CRAB = 44,
  DARWINIA = 46,
  ARBITRUM = 42161,
  ARBITRUM_GOERLI = 421613,
}

export type Network = "ethereum" | "goerli" | "darwinia" | "crab" | "arbitrum" | "arbitrum-goerli";

export interface ChainConfig {
  id: ChainID;
  network: Network;
  name: string;
}
