export type BridgeCategory =
  | "lnbridgev20-default"
  | "lnbridgev20-opposite"
  | "helix-sub2ethv2(lock)"
  | "helix-sub2ethv2(unlock)"
  | "helix-sub2subv21(unlock)"
  | "helix-sub2subv21(lock)"
  | "lpbridge-darwinia-dvm"
  | "lpbridge-ethereum";

export interface BridgeContract {
  sourceAddress: `0x${string}`;
  targetAddress: `0x${string}`;
}

export type BridgeLogoType = "symbol" | "horizontal";
