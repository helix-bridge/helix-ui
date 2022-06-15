/// <reference types="jest" />

import { crabConfig, crabDVMConfig, pangolinConfig } from '../config/network';
import { pangolinDVMConfig } from '../config/network/pangolin-dvm';
import { crossChainGraph } from '../utils/network/graph';
import { chainConfigs, getChainConfig } from '../utils/network/network';

describe('network utils', () => {
  it('should create bridge graphs', () => {
    const data = [...crossChainGraph];
    const fromCrab = data.find((item) => item[0] === 'crab');

    expect(fromCrab).not.toEqual(undefined);
    expect(fromCrab![1]).toEqual(['crab-dvm', 'crab-parachain']);

    const fromCrabDVM = data.find((item) => item[0] === 'crab-dvm');

    expect(fromCrabDVM).not.toEqual(undefined);
    expect(fromCrabDVM![1]).toEqual(['crab', 'darwinia']);

    const fromDarwinia = data.find((item) => item[0] === 'darwinia');

    expect(fromDarwinia).not.toEqual(undefined);
    expect(fromDarwinia![1]).toEqual(['crab-dvm', 'ethereum']);

    const fromEthereum = data.find((item) => item[0] === 'ethereum');

    expect(fromEthereum).not.toEqual(undefined);
    expect(fromEthereum![1]).toEqual(['darwinia']);

    const fromPangolin = data.find((item) => item[0] === 'pangolin');

    expect(fromPangolin).not.toEqual(undefined);
    expect(fromPangolin![1]).toEqual(['pangolin-dvm', 'ropsten', 'pangolin-parachain']);

    const fromPangolinDVM = data.find((item) => item[0] === 'pangolin-dvm');

    expect(fromPangolinDVM).not.toEqual(undefined);
    expect(fromPangolinDVM![1]).toEqual(['pangolin', 'pangoro']);

    const fromPangoro = data.find((item) => item[0] === 'pangoro');

    expect(fromPangoro).not.toEqual(undefined);
    expect(fromPangoro![1]).toEqual(['pangolin-dvm']);

    const fromRopsten = data.find((item) => item[0] === 'ropsten');

    expect(fromRopsten).not.toEqual(undefined);
    expect(fromRopsten![1]).toEqual(['pangolin']);
  });

  it('should have 10 cross-chains', () => {
    expect(chainConfigs).toHaveLength(10);
  });

  it('can get chain config by chain name', () => {
    chainConfigs.forEach((chain) => {
      const { name } = chain;
      const compared = getChainConfig(name);

      expect(chain).toEqual(compared);
    });
  });
});
