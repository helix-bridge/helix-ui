import { tokenIconConfig } from "@/config";
import { TokenSymbol } from "helix.js";

export function getTokenIcon(token: TokenSymbol) {
  return tokenIconConfig[token] || "unknown.svg";
}
