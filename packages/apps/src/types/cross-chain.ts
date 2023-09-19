import { TokenSymbol } from "./token";
import { BridgeCategory, BridgeContract } from "./bridge";
import { Network } from "./chain";

export type CrossChain = {
  [sourceChain in Network]?: {
    [targetChain in Network]?: {
      [bridge in BridgeCategory]?: {
        contract: BridgeContract;
        tokens: { sourceToken: TokenSymbol; targetToken: TokenSymbol; deprecated?: boolean }[];
      };
    };
  };
};

export interface ChainTokens {
  network: Network;
  symbols: TokenSymbol[];
}

export type AvailableBridges = {
  [sourceChain in Network]?: {
    [targetChain in Network]?: {
      [token in TokenSymbol]?: { category: BridgeCategory; contract: BridgeContract }[];
    };
  };
};

export type AvailableTargetChainTokens = {
  [sourceChain in Network]?: {
    [token in TokenSymbol]?: ChainTokens[];
  };
};
