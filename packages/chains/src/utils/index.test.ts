import { HelixChain } from "@helixbridge/helixconf";
import { getChainByIdOrNetwork, getChains } from ".";
import { Network } from "../types";

test("An equal number of chains should be configured", () => {
  expect(getChains().length).toBe(HelixChain.chains().length);
});

describe.each(HelixChain.chains().map(({ id, code, name }) => ({ id, code, name })))("$name", ({ id, code }) => {
  test(`getChainByIdOrNetwork(${id}) should return the correct chain`, () => {
    expect(getChainByIdOrNetwork(Number(id))?.network).toBe(code);
  });
  test(`getChainByIdOrNetwork('${code}') should return the correct chain`, () => {
    expect(getChainByIdOrNetwork(code as Network)?.id).toBe(Number(id));
  });

  const logo = getChainByIdOrNetwork(Number(id))?.logo;
  if (logo) {
    test(`${logo} should be available`, async () => {
      const res = await fetch(logo);
      expect(res.status).not.toBe(404);
    });
  }
});
