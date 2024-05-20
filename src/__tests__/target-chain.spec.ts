import { describe, expect, it } from "vitest";
import { getChainConfigs } from "../utils";

describe.each(getChainConfigs(true).filter((c) => !!c.tokens.length))(
  `Test cross's target network: $network`,
  ({ network, tokens }) => {
    describe.each(tokens)(`$symbol`, (token) => {
      if (token.cross.length) {
        it.each(token.cross)(`$target.network`, (cross) => {
          expect(cross.target.network).not.toBe(network);
        });
      } else {
        it("Cross is empty", () => {
          expect(token.cross.length).toEqual(0);
        });
      }
    });
  },
);
