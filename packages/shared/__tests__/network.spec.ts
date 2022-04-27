import { CROSS_CHAIN_NETWORKS } from '../utils/network';
import { NETWORK_GRAPH } from '../utils/network/graph';

describe('network utils', () => {
  it('should always true', () => {
    expect(1 + 1).toBe(2);
  });

  it('should create bridge graphs', () => {
    const data = [...NETWORK_GRAPH];
    const fromCrab = data.find((item) => item[0].network === 'crab' && item[0].mode === 'native');

    expect(fromCrab).not.toBe(undefined);
    expect(fromCrab![1]).toEqual([{ network: 'crab', mode: 'dvm' }]);

    const fromCrabDVM = data.find((item) => item[0].network === 'crab' && item[0].mode === 'dvm');

    expect(fromCrabDVM).not.toBe(undefined);
    expect(fromCrabDVM![1]).toEqual([
      { network: 'crab', mode: 'native' },
      { network: 'darwinia', mode: 'native' },
      { network: 'ethereum', mode: 'native' },
    ]);

    const fromDarwinia = data.find((item) => item[0].network === 'darwinia' && item[0].mode === 'native');

    expect(fromDarwinia).not.toBe(undefined);
    expect(fromDarwinia![1]).toEqual([
      { network: 'crab', mode: 'dvm' },
      { network: 'ethereum', mode: 'native' },
    ]);

    const fromEthereum = data.find((item) => item[0].network === 'ethereum' && item[0].mode === 'native');

    expect(fromEthereum).not.toBe(undefined);
    expect(fromEthereum![1]).toEqual([
      { network: 'crab', mode: 'dvm' },
      { network: 'darwinia', mode: 'native' },
    ]);

    const fromPangolin = data.find((item) => item[0].network === 'pangolin' && item[0].mode === 'native');

    expect(fromPangolin).not.toBe(undefined);
    expect(fromPangolin![1]).toEqual([
      { network: 'pangolin', mode: 'dvm' },
      { network: 'ropsten', mode: 'native' },
    ]);

    const fromPangolinDVM = data.find((item) => item[0].network === 'pangolin' && item[0].mode === 'dvm');

    expect(fromPangolinDVM).not.toBe(undefined);
    expect(fromPangolinDVM![1]).toEqual([
      { network: 'pangolin', mode: 'native' },
      { network: 'pangoro', mode: 'native' },
      { network: 'ropsten', mode: 'native' },
    ]);

    const fromPangoro = data.find((item) => item[0].network === 'pangoro' && item[0].mode === 'native');

    expect(fromPangoro).not.toBe(undefined);
    expect(fromPangoro![1]).toEqual([{ network: 'pangolin', mode: 'dvm' }]);

    const fromRopsten = data.find((item) => item[0].network === 'ropsten' && item[0].mode === 'native');

    expect(fromRopsten).not.toBe(undefined);
    expect(fromRopsten![1]).toEqual([
      { network: 'pangolin', mode: 'native' },
      { network: 'pangolin', mode: 'dvm' },
    ]);
  });

  it.only('should have 9 cross-chains', () => {
    expect(CROSS_CHAIN_NETWORKS).toHaveLength(9);
  });
});
