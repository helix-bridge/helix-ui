import { HelixChain } from "@helixbridge/helixconf";
import { getChainByIdOrNetwork, getChains } from ".";
import { ChainID } from "../types";

const numberOfChains = Object.keys(ChainID).length / 2;
const chains = getChains();

test(`The number of chains should be equal to ${numberOfChains}`, () => {
  expect(chains.length).toBe(numberOfChains);
});

describe.each(getChains())("$name", ({ id, network }) => {
  test(`The 'network' should be configured correctly`, () => {
    expect(network).toBe(HelixChain.get(id)?.code);
  });

  test(`getChainByIdOrNetwork(${id}) should return the correct chain`, () => {
    expect(getChainByIdOrNetwork(id)?.network).toBe(network);
  });
  test(`getChainByIdOrNetwork('${network}') should return the correct chain`, () => {
    expect(getChainByIdOrNetwork(network)?.id).toBe(id);
  });
});
