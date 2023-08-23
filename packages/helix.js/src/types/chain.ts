import type { Token, TokenSymbol } from "./token";
import type { BridgeCategory } from "./bridge";

export enum ChainID {
  ETHEREUM = 1,
  GOERLI = 5,
  CRAB = 44,
  DARWINIA = 46,
  ARBITRUM = 42161,
  ARBITRUM_GOERLI = 421613,
}

export type Network = "goerli" | "arbitrum-goerli";

export interface ChainConfig {
  id: ChainID;
  network: Network;
  name: string;
  tokens: Token[];
  crossChain: {
    [destination in Partial<Network>]?: {
      [bridge in Partial<BridgeCategory>]?: {
        bridgeContract: {
          sourceAddress: `0x${string}`;
          targetAddress: `0x${string}`;
        };
        tokens: { sourceToken: TokenSymbol; targetToken: TokenSymbol }[];
      };
    };
  };
}
