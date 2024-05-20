import { describe, expect, it } from "vitest";
import { getChainConfigs } from "../utils";

describe.each(getChainConfigs(true).filter((c) => !!c.tokens.length))(
  `Should configure native token`,
  ({ name, tokens }) => {
    it(name, () => {
      expect(tokens.some((t) => t.type === "native")).not.toBeFalsy();
    });
  },
);
