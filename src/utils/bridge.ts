import { BaseBridge, LnBridgeV2Default, LnBridgeV2Opposite, LnBridgeV3 } from "../bridges";
import { BridgeConstructorArgs, ChainConfig, Token } from "../types";

export function bridgeFactory(args: BridgeConstructorArgs): BaseBridge | undefined {
  switch (args.category) {
    case "lnv3":
      return new LnBridgeV3({ ...args, category: "lnbridge" });
    case "lnv2-default":
      return new LnBridgeV2Default({ ...args, category: "lnbridge" });
    case "lnv2-opposite":
      return new LnBridgeV2Opposite({ ...args, category: "lnbridge" });
    default:
      return;
  }
}

export function isLnV2DefaultBridge(
  sourceToken: Token | null | undefined,
  targetChain: ChainConfig | null | undefined,
) {
  return !!sourceToken?.cross.some(
    (c) =>
      c.target.network === targetChain?.network && c.bridge.category === "lnbridge" && c.bridge.lnv2Type === "default",
  );
}

export function isLnV2OppositeBridge(
  sourceToken: Token | null | undefined,
  targetChain: ChainConfig | null | undefined,
) {
  return !!sourceToken?.cross.some(
    (c) =>
      c.target.network === targetChain?.network && c.bridge.category === "lnbridge" && c.bridge.lnv2Type === "opposite",
  );
}
