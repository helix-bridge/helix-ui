import { BridgeCategory } from "./bridge";
import { ChainConfig, Network } from "./chain";
import { Token, TokenSymbol } from "./token";

export interface ChainTokens {
  chain: ChainConfig;
  tokens: Token[];
}

export interface ChainToken {
  chain: ChainConfig;
  token: Token;
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
  [sourceChain in Network]?: ChainConfig[];
};

export type AvailableTokens = {
  [sourceChain in Network]?: {
    [targetChain in Network]?: Token[];
  };
};
