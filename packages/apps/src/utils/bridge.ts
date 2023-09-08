import { bridgeIconConfig } from "@/config/bridge-icon";
import { BridgeCategory } from "helix.js";

export function getBridgeIcon(bridge: BridgeCategory) {
  return bridgeIconConfig[bridge] || "unknown.svg";
}
