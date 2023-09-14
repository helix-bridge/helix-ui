export type BridgeCategory = "lnbridgev20-default" | "lnbridgev20-opposite";

export interface BridgeContract {
  sourceAddress: `0x${string}`;
  targetAddress: `0x${string}`;
}
