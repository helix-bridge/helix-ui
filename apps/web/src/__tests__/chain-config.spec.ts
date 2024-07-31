import { describe, expect, it } from "vitest";
import { getChainConfigs } from "../utils";

describe.each(getChainConfigs(true).filter((c) => !!c.tokens.length))("$name", ({ tokens }) => {
  it("Should configure native token", () => {
    expect(tokens.some((t) => t.type === "native")).not.toBeFalsy();
  });
});
