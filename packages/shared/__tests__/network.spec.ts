/// <reference types="jest" />

import { crossChainGraph } from '../utils/network/graph';
import { chainConfigs } from '../utils/network/network';

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
      { name: 'ethereum', mode: 'native' },
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
      { name: 'crab', mode: 'dvm' },
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
      { name: 'ropsten', mode: 'native' },
    ]);

    const fromPangoro = data.find((item) => item[0].name === 'pangoro' && item[0].mode === 'native');

    expect(fromPangoro).not.toEqual(undefined);
    expect(fromPangoro![1]).toEqual([{ name: 'pangolin', mode: 'dvm' }]);

    const fromRopsten = data.find((item) => item[0].name === 'ropsten' && item[0].mode === 'native');

    expect(fromRopsten).not.toEqual(undefined);
    expect(fromRopsten![1]).toEqual([
      { name: 'pangolin', mode: 'native' },
      { name: 'pangolin', mode: 'dvm' },
    ]);
  });

  it('should have 8 cross-chains', () => {
    expect(chainConfigs).toHaveLength(8);
  });
});
