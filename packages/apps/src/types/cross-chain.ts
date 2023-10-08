import { L2BridgeCategory, LnBridgeCategory, HelixLpBridgeCategory, HelixBridgeCategory } from "./bridge";
import { ChainToken } from "./misc";

export type CrossChain =
  | {
      target: ChainToken;
      bridge: { category: LnBridgeCategory };
      index?: never;
      price?: never;
      baseFee?: never;
      action?: never;
      hidden?: boolean;
    }
  | {
      target: ChainToken;
      bridge: { category: HelixBridgeCategory };
      index?: never;
      price?: never;
      baseFee?: never;
      action: "issue" | "redeem";
      hidden?: boolean;
    }
  | {
      target: ChainToken;
      bridge: { category: HelixLpBridgeCategory };
      index: number; // One of the bridge contract transfer parameters
      price?: bigint; // When transferring native token, we need to set the price
      baseFee: bigint;
      action: "issue" | "redeem";
      hidden?: boolean;
    }
  | {
      target: ChainToken;
      bridge: { category: L2BridgeCategory };
      index?: never;
      price?: never;
      baseFee?: never;
      action?: never;
      hidden?: boolean;
    };
