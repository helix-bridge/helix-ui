import { getChainsConfig } from "../utils/chain";
import type { ChainConfig } from "../types/chain";

describe.each(getChainsConfig() as ChainConfig[])("Should configure native token", ({ network, tokens }) => {
  it(`${network}`, () => {
    if (tokens.length) {
      expect(tokens.some((t) => t.type === "native")).not.toBeFalsy();
    }
  });
});
