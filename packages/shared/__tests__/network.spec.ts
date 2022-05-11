/// <reference types="jest" />

import { crabConfig, crabDVMConfig, pangolinConfig } from '../config/network';
import { pangolinDVMConfig } from '../config/network/pangolin-dvm';
import { crossChainGraph } from '../utils/network/graph';
import { chainConfigs, getChainConfig } from '../utils/network/network';

describe('network utils', () => {
  it('should always true', () => {
    expect(1 + 1).toBe(2);
  });

  it('should create bridge graphs', () => {
    const data = [...crossChainGraph];
    const fromCrab = data.find((item) => item[0].name === 'crab' && item[0].mode === 'native');

    expect(fromCrab).not.toEqual(undefined);
    expect(fromCrab![1]).toEqual([{ name: 'crab', mode: 'dvm' }]);

    const fromCrabDVM = data.find((item) => item[0].name === 'crab' && item[0].mode === 'dvm');

    expect(fromCrabDVM).not.toEqual(undefined);
    expect(fromCrabDVM![1]).toEqual([
      { name: 'crab', mode: 'native' },
      { name: 'darwinia', mode: 'native' },
    ]);

    const fromDarwinia = data.find((item) => item[0].name === 'darwinia' && item[0].mode === 'native');

    expect(fromDarwinia).not.toEqual(undefined);
    expect(fromDarwinia![1]).toEqual([
      { name: 'crab', mode: 'dvm' },
      { name: 'ethereum', mode: 'native' },
    ]);

    const fromEthereum = data.find((item) => item[0].name === 'ethereum' && item[0].mode === 'native');

    expect(fromEthereum).not.toEqual(undefined);
    expect(fromEthereum![1]).toEqual([
      { name: 'darwinia', mode: 'native' },
    ]);

    const fromPangolin = data.find((item) => item[0].name === 'pangolin' && item[0].mode === 'native');

    expect(fromPangolin).not.toEqual(undefined);
    expect(fromPangolin![1]).toEqual([
      { name: 'pangolin', mode: 'dvm' },
      { name: 'ropsten', mode: 'native' },
    ]);

    const fromPangolinDVM = data.find((item) => item[0].name === 'pangolin' && item[0].mode === 'dvm');

    expect(fromPangolinDVM).not.toEqual(undefined);
    expect(fromPangolinDVM![1]).toEqual([
      { name: 'pangolin', mode: 'native' },
      { name: 'pangoro', mode: 'native' },
    ]);

    const fromPangoro = data.find((item) => item[0].name === 'pangoro' && item[0].mode === 'native');

    expect(fromPangoro).not.toEqual(undefined);
    expect(fromPangoro![1]).toEqual([{ name: 'pangolin', mode: 'dvm' }]);

    const fromRopsten = data.find((item) => item[0].name === 'ropsten' && item[0].mode === 'native');

    expect(fromRopsten).not.toEqual(undefined);
    expect(fromRopsten![1]).toEqual([
      { name: 'pangolin', mode: 'native' },
    ]);
  });

  it('should have 8 cross-chains', () => {
    expect(chainConfigs).toHaveLength(8);
  });

  it('can get chain config by token name, vertices and Network', () => {
    // by token name
    chainConfigs
      .filter((item) => item.name !== 'ethereum' && item.name !== 'ropsten')
      .forEach((chain) => {
        chain.tokens.forEach((token) => {
          const config = getChainConfig(token.symbol, token.type !== chain.mode ? chain.mode : token.type);
          expect(config).toEqual(chain);
        });
      });

    // if token is ether: need chain name params
    chainConfigs
      .filter((item) => item.name === 'ethereum' || item.name === 'ropsten')
      .forEach((chain) => {
        chain.tokens.forEach((token) => {
          const config = getChainConfig(token.symbol, chain.name);
          expect(config).toEqual(chain);
        });
      });

    // by vertices
    chainConfigs.forEach((chain) => {
      const { name, mode } = chain;
      const compared = getChainConfig({ name, mode });

      expect(chain).toEqual(compared);
    });

    // by chain name only: native chain config
    chainConfigs.forEach((chain) => {
      const { name } = chain;
      const compared = getChainConfig(name);

      if (name === 'pangolin') {
        expect(compared).toEqual(pangolinConfig);
      } else if (name === 'crab') {
        expect(compared).toEqual(crabConfig);
      } else {
        expect(compared).toEqual(chain);
      }
    });

    // by chain name and mode
    const pangolinDVM = getChainConfig({ name: 'pangolin', mode: 'dvm' });
    const crabDVM = getChainConfig({ name: 'crab', mode: 'dvm' });

    expect(pangolinDVM).toEqual(pangolinDVMConfig);
    expect(crabDVM).toEqual(crabDVMConfig);
  });
});
