import { BridgeCategory } from "./bridge";
import { Network } from "./chain";
import { TokenSymbol } from "./token";

export interface ChainTokens {
  network: Network;
  symbols: TokenSymbol[];
}

export interface ChainToken {
  network: Network;
  symbol: TokenSymbol;
}

/**
 * Transfer `sourceToken` from `sourceChain` to `targetChain`
 */
export type AvailableBridges = {
  [sourceChain in Network]?: {
    [targetChain in Network]?: {
      [sourceToken in TokenSymbol]?: BridgeCategory[];
    };
  };
};

/**
 * Where can we transfer the `sourceToken` from the `sourceChain`
 */
export type AvailableTargets = {
  [sourceChain in Network]?: {
    [sourceToken in TokenSymbol]?: ChainTokens[];
  };
};

export type AvailableTargetChains = {
  [sourceChain in Network]?: Network[];
};
