import { BridgeConfig } from "@/types";
import { BridgeCategory } from "helix.js";

export const bridgeConfig: { [token in BridgeCategory]?: BridgeConfig } = {
  "lnbridgev20-default": {
    logo: "lnbridge.png",
    name: "Helix LnBridge",
    category: "lnbridgev20-default",
  },
  "lnbridgev20-opposite": {
    logo: "lnbridge.png",
    name: "Helix LnBridge",
    category: "lnbridgev20-opposite",
  },
};
