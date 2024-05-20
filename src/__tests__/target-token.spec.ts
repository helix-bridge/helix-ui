import { describe, expect, it } from "vitest";
import { getChainConfig, getChainConfigs } from "../utils";

describe.each(getChainConfigs(true).filter((c) => !!c.tokens.length))(
  `Should configure target token`,
  ({ network, tokens }) => {
    describe.each(tokens)(`Cross $symbol from ${network}`, (token) => {
      if (token.cross.length) {
        it.each(token.cross)(`to $target.network $target.symbol`, (cross) => {
          expect(
            getChainConfig(cross.target.network)?.tokens.find((t) => t.symbol === cross.target.symbol),
          ).not.toBeUndefined();
        });
      } else {
        it("Cross is empty", () => {
          expect(token.cross.length).toEqual(0);
        });
      }
    });
  },
);
