import { getChainsConfig } from "../utils/chain";
import type { ChainConfig } from "../types/chain";

describe.each(getChainsConfig() as ChainConfig[])(
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
