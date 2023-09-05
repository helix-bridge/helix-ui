import { tokenIconConfig } from "@/config";
import { TokenSymbol } from "helix.js";

export function getTokenIconSrc(symbol: TokenSymbol) {
  return tokenIconConfig[symbol] || "unknown.svg";
}
