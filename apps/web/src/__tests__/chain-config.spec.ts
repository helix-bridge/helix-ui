import { describe, expect, it } from "vitest";
import { getChainConfig, getChainConfigs } from "../utils";
import { createPublicClient, http } from "viem";
import abi from "../abi/erc20";

describe.each(getChainConfigs(true).filter((c) => !!c.tokens.length))("$name", ({ tokens, ...chain }) => {
  const publicClient = createPublicClient({ chain, transport: http() });

  it("Should configure native token", () => {
    expect(tokens.some((t) => t.type === "native")).not.toBeFalsy();
  });

  describe.each(tokens.filter((t) => !!t.cross.length))("$symbol", (token) => {
    it.each(token.cross)(
      `The target chain should not be configured as the source chain: '${chain.network}' => $target.network`,
      (cross) => {
        expect(cross.target.network).not.toBe(chain.network);
      },
    );

    it.each(token.cross)("The target chain should already be configured: $target.network", (cross) => {
      expect(getChainConfig(cross.target.network)).toBeDefined();
    });

    it.each(token.cross)("The target token should already be configured: $target.symbol", (cross) => {
      expect(getChainConfig(cross.target.network)?.tokens.find((t) => t.symbol === cross.target.symbol)).toBeDefined();
    });

    it.skipIf(chain.network === "bera" || chain.network === "taiko")(
      `Should configure the correct decimals: '${token.decimals}'`,
      async () => {
        if (token.type === "native") {
          expect(token.decimals).toEqual(18);
        } else {
          const decimals = await publicClient.readContract({ address: token.address, abi, functionName: "decimals" });
          expect(token.decimals).toEqual(decimals);
        }
      },
    );
  });
});
