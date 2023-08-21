import { TokenSymbol } from "./token";
import { ChainID } from "./chain";

export interface CrossConfig {
  fromChain: ChainID;
  toChain: ChainID;
  fromToken: TokenSymbol;
  toToken: TokenSymbol;
}
