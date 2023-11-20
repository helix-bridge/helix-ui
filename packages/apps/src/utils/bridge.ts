import {
  BaseBridge,
  HelixBridgeDVMDVM,
  HelixBridgeDVMEVM,
  HelixLpBridge,
  L2ArbitrumBridge,
  LnBridgeDefault,
  LnBridgeOpposite,
} from "@/bridges";
import { BridgeConstructorArgs } from "@/types";

export function bridgeFactory(args: BridgeConstructorArgs): BaseBridge | undefined {
  switch (args.category) {
    case "lnbridgev20-default":
      return new LnBridgeDefault(args);
    case "lnbridgev20-opposite":
      return new LnBridgeOpposite(args);
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
    default:
      return;
  }
}
