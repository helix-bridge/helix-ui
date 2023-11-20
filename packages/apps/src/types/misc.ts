import { BridgeCategory } from "./bridge";
import { ChainConfig, Network } from "./chain";
import { Token, TokenSymbol } from "./token";

export type AvailableBridges = {
  [sourceChain in Network]?: {
    [targetChain in Network]?: {
      [sourceToken in TokenSymbol]?: BridgeCategory[];
    };
  };
};

export type AvailableSourceTokens = {
  [sourceChain in Network]?: {
    [targetChain in Network]?: Token[];
  };
};

export type AvailableTargetChains = {
  [sourceChain in Network]?: ChainConfig[];
};

export type AvailableTargetTokens = {
  [sourceChain in Network]?: {
    [targetChain in Network]?: {
      [sourceToken in TokenSymbol]?: Token[];
    };
  };
};

export interface InputValue<T = unknown> {
  input: string;
  value: T;
  valid: false;
}
