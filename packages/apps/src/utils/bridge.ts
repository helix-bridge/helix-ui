import { bridgeConfig } from "@/config/bridge";
import { BridgeCategory } from "helix.js";

export function getBridgeConfig(bridge?: BridgeCategory | null) {
  return bridge ? bridgeConfig[bridge] : undefined;
}
