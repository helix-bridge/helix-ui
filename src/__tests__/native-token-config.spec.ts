import { describe, expect, it } from "@jest/globals";
import { getChainConfigs } from "../utils/chain";
import type { ChainConfig } from "../types/chain";

describe.each(getChainConfigs(true) as ChainConfig[])("Should configure native token", ({ network, tokens }) => {
  it(`${network}`, () => {
    if (tokens.length) {
      expect(tokens.some((t) => t.type === "native")).not.toBeFalsy();
    }
  });
});
