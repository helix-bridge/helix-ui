import { BaseBridge } from "@/bridges/base";
import { HelixLpBridge } from "@/bridges/helix-lpbridge";
import { HelixBridgeDVMDVM } from "@/bridges/helixbridge-dvmdvm";
import { HelixBridgeDVMEVM } from "@/bridges/helixbridge-dvmevm";
import { L2ArbitrumBridge } from "@/bridges/l2bridge";
import { LnBridgeDefault } from "@/bridges/lnbridge-default";
import { LnBridgeOpposite } from "@/bridges/lnbridge-opposite";
import { BridgeCategory } from "@/types/bridge";
import { ChainConfig } from "@/types/chain";
import { Token } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";

export function bridgeFactory(args: {
  walletClient?: WalletClient | null;
  publicClient?: PublicClient;
  category: BridgeCategory;

  sourceChain?: ChainConfig;
  targetChain?: ChainConfig;
  sourceToken?: Token;
  targetToken?: Token;
}): BaseBridge | undefined {
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
