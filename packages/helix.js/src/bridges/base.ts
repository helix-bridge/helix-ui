import { BridgeCategory, ChainID } from "@/types";

export abstract class BaseBridge {
  public readonly fromChain: ChainID;
  public readonly toChain: ChainID;
  protected readonly category: BridgeCategory;

  constructor(args: { fromChain: ChainID; toChain: ChainID; category: BridgeCategory }) {
    this.fromChain = args.fromChain;
    this.toChain = args.toChain;
    this.category = args.category;
  }

  getCategory() {
    return this.category;
  }

  getEstimateTime(): string | undefined {
    return undefined;
  }

  getFee(): bigint | undefined {
    return undefined;
  }

  abstract transfer(sender: string, receiver: string, amount: bigint, options?: Object): Promise<void>;
  abstract getName(): string;
}
