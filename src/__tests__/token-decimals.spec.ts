import { describe, expect, it } from "@jest/globals";
import { getChainConfigs } from "../utils/chain";
import { ChainConfig } from "../types/chain";
import { createPublicClient, http } from "viem";
import abi from "../abi/erc20";

describe.each(getChainConfigs(true) as ChainConfig[])(`Test token's decimals: $name`, ({ tokens, ...chain }) => {
  const publicClient = createPublicClient({ chain, transport: http() });

  it.each(tokens)(`$symbol`, async (token) => {
    if (token.type === "native") {
      expect(token.decimals).toEqual(18);
    } else {
      const decimals = await publicClient.readContract({ address: token.address, abi, functionName: "decimals" });
      expect(token.decimals).toEqual(decimals);
    }
  });
});
