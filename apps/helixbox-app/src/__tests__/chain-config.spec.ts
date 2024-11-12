import { describe, expect, it } from "vitest";
import { getChainConfig, getChainConfigs } from "../utils";
import { HelixChain } from "@helixbridge/helixconf";

it("An equal number of chains should be configured", () => {
  expect(getChainConfigs(true).length).toBe(HelixChain.chains().length);
});

describe.each(getChainConfigs(true).filter((c) => !!c.tokens.length))("$name", ({ tokens }) => {
  it("Should configure native token", () => {
    expect(tokens.some((t) => t.type === "native")).not.toBeFalsy();
  });
});

describe.each(HelixChain.chains())("$name", ({ id, code }) => {
  it("The same chain needs to be configured", () => {
    expect(getChainConfig(Number(id))?.network).toBe(code);
  });
});

const tokenLogos = new Set<string>();
HelixChain.chains().forEach((chain) => {
  chain.tokens.forEach((token) => tokenLogos.add(token.logo));
});
describe.each([...tokenLogos])("%s", (url) => {
  it("Should be available", async () => {
    const res = await fetch(url);
    expect(res.status).not.toBe(404);
  });
});
