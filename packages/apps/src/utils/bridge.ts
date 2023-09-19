import { BaseBridge } from "@/bridges/base";
import { HelixSub2ethv2 } from "@/bridges/helix-sub2ethv2";
import { LnBridgeDefault } from "@/bridges/lnbridge-default";
import { LnBridgeOpposite } from "@/bridges/lnbridge-opposite";
import { BridgeCategory, BridgeContract } from "@/types/bridge";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { PublicClient, WalletClient } from "wagmi";

export function bridgeFactory(args: {
  category: BridgeCategory;
  contract?: BridgeContract;

  sourceChain?: Network;
  targetChain?: Network;
  sourceToken?: TokenSymbol;
  targetToken?: TokenSymbol;

  publicClient?: PublicClient;
  walletClient?: WalletClient | null;
}): BaseBridge | undefined {
  switch (args.category) {
    case "lnbridgev20-default":
      return new LnBridgeDefault(args);
    case "lnbridgev20-opposite":
      return new LnBridgeOpposite(args);
    case "helix-sub2ethv2(lock)":
    case "helix-sub2ethv2(unlock)":
      return new HelixSub2ethv2(args);
    default:
      return;
  }
}
