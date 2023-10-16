import { L2BridgeCategory, LnBridgeCategory, HelixLpBridgeCategory, HelixBridgeCategory } from "./bridge";
import { Network } from "./chain";
import { TokenSymbol } from "./token";

interface Target {
  network: Network;
  symbol: TokenSymbol;
}

export type CrossChain =
  | {
      target: Target;
      bridge: { category: LnBridgeCategory };
      index?: never;
      price?: never;
      baseFee?: never;
      action?: never;
      hidden?: boolean;
    }
  | {
      target: Target;
      bridge: { category: HelixBridgeCategory };
      index?: never;
      price?: never;
      baseFee?: never;
      action: "issue" | "redeem";
      hidden?: boolean;
    }
  | {
      target: Target;
      bridge: { category: HelixLpBridgeCategory };
      index: number; // One of the bridge contract transfer parameters
      price?: bigint; // When transferring native token, we need to set the price
      baseFee: bigint;
      action: "issue" | "redeem";
      hidden?: boolean;
    }
  | {
      target: Target;
      bridge: { category: L2BridgeCategory };
      index?: never;
      price?: never;
      baseFee?: never;
      action?: never;
      hidden?: boolean;
    };
