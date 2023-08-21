import { ChainID } from "@/types";
import { BaseBridge } from "./base";

export class LnBridgeDefault extends BaseBridge {
  constructor(args: { fromChain: ChainID; toChain: ChainID }) {
    super({ fromChain: args.fromChain, toChain: args.toChain, category: "lnbridgev20-default" });
  }

  async transfer(): Promise<void> {}

  getName(): string {
    return "Helix LnBridge";
  }
}
