import { describe, expect, it } from "@jest/globals";
import { getChainConfigs, getChainConfig } from "../utils/chain";
import type { ChainConfig } from "../types/chain";

describe.each(getChainConfigs(true) as ChainConfig[])(
  "Should configure price for HelixLpBridge to cross native token",
  ({ network, tokens }) => {
    if (tokens.length) {
      describe.each(tokens)(`Cross $symbol from ${network}`, (token) => {
        if (token.cross.length) {
          it.each(token.cross)(`to $target.network`, (cross) => {
            if (token.type === "native" && cross.bridge.category.startsWith("lpbridge-")) {
              expect(cross.price).not.toBeUndefined();
            }
          });
        }
      });
    }
  },
);

describe.each(getChainConfigs(true) as ChainConfig[])("Should configure target token", ({ network, tokens }) => {
  if (tokens.length) {
    describe.each(tokens)(`Cross $symbol from ${network}`, (token) => {
      if (token.cross.length) {
        it.each(token.cross)(`to $target.network ($target.symbol)`, (cross) => {
          const targetChain = getChainConfig(cross.target.network) as ChainConfig | undefined;
          const targetToken = targetChain?.tokens.find((t) => t.symbol === cross.target.symbol);
          expect(targetToken).not.toBeUndefined();
        });
      }
    });
  }
});
