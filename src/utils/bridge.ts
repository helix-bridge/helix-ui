import {
  BaseBridge,
  HelixBridgeDVMDVM,
  HelixBridgeDVMEVM,
  HelixLpBridge,
  L2ArbitrumBridge,
  XTokenNextBridge,
} from "@/bridges";
import { BridgeConstructorArgs } from "@/types";

export function bridgeFactory(args: BridgeConstructorArgs): BaseBridge | undefined {
  switch (args.category) {
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
    case "xtoken-ethereum":
      return new XTokenNextBridge(args);
    default:
      return;
  }
}
