import {
  BaseBridge,
  HelixBridgeDVMDVM,
  HelixBridgeDVMEVM,
  HelixLpBridge,
  L2ArbitrumBridge,
  LnBridgeV2Default,
  LnBridgeV2Opposite,
  LnBridgeV3,
  XTokenV3Bridge,
} from "@/bridges";
import { BridgeConstructorArgs, ChainConfig, Token } from "@/types";

export function bridgeFactory(args: BridgeConstructorArgs): BaseBridge | undefined {
  switch (args.category) {
    case "lnv3":
      return new LnBridgeV3({ ...args, category: "lnbridge" });
    case "lnv2-default":
      return new LnBridgeV2Default({ ...args, category: "lnbridge" });
    case "lnv2-opposite":
      return new LnBridgeV2Opposite({ ...args, category: "lnbridge" });
    case "helix-sub2ethv2(lock)":
    case "helix-sub2ethv2(unlock)":
      return new HelixBridgeDVMEVM(args);
    case "helix-sub2subv21(lock)":
    case "helix-sub2subv21(unlock)":
      return new HelixBridgeDVMDVM(args);
    case "lpbridge-darwinia-dvm":
    case "lpbridge-ethereum":
      return new HelixLpBridge(args);
    case "l2arbitrumbridge-ethereum":
      return new L2ArbitrumBridge(args);
    case "xtoken-darwinia-dvm":
    case "xtoken-crab-dvm":
    case "xtoken-pangolin-dvm":
    case "xtoken-sepolia":
      return new XTokenV3Bridge(args);
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
