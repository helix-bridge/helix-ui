import { Address } from "viem";

/**
 * lpbridge-darwinia-dvm etc. are named from graphql indexer.
 */
export type LnBridgeCategory = "lnbridgev20-default" | "lnbridgev20-opposite";
export type L2BridgeCategory = "l2arbitrumbridge-ethereum";
export type HelixLpBridgeCategory = "lpbridge-darwinia-dvm" | "lpbridge-ethereum";
export type HelixBridgeCategory =
  | "helix-sub2ethv2(lock)"
  | "helix-sub2ethv2(unlock)"
  | "helix-sub2subv21(unlock)"
  | "helix-sub2subv21(lock)";
export type BridgeCategory = LnBridgeCategory | L2BridgeCategory | HelixLpBridgeCategory | HelixBridgeCategory;

export interface BridgeContract {
  sourceAddress: Address;
  targetAddress: Address;
}

export type BridgeLogoType = "symbol" | "horizontal";
