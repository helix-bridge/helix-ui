import { BridgeCategory, BridgeV2Type } from "./bridge";
import { Network, ChainConfig } from "./chain";
import { TokenSymbol, Token } from "./token";

interface Target {
  network: Network;
  symbol: TokenSymbol;
}

export type CrossChain = {
  target: Target;
  bridge: { category: BridgeCategory; lnv2Type: BridgeV2Type; disableV2?: boolean };
  hidden?: boolean;
};

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
