/// <reference types="jest" />

import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import {
  arbitrumConfig,
  astarConfig,
  avalancheConfig,
  bscConfig,
  crabDVMConfig,
  darwiniaDVMConfig,
  karuraConfig,
  moonriverConfig,
  optimismConfig,
  pangolinDVMConfig,
  pangoroDVMConfig,
  SYSTEM_CHAIN_CONFIGURATIONS,
} from 'shared/config/network';
import { crabParachainConfig } from 'shared/config/network/crab-parachain';
import { Network } from 'shared/model';
import {
  chainConfigs,
  crossChainGraph,
  getChainConfig,
  getDisplayName,
  getOriginChainConfig,
  getWrappedToken,
} from '../utils/network';

describe('network utils', () => {
  const data = [...crossChainGraph];
  const sort = (ary: string[]) => sortBy(ary, (cur) => cur.split('').reduce((acc, cur) => acc + cur.charAt(0)));
  const getOverview = (departure: Network, arrival: Network) =>
    chainConfigs
      .find((item) => item.name === departure)
      ?.tokens.map((token) => token.cross)
      .flat()
      .find((item) => item.partner.name === arrival);

  it('should contains chains count: ', () => {
    expect(chainConfigs).toHaveLength(20);
  });

  it('crab-dvm contains 5 leafs and substrate-substrateDVM deprecated', () => {
    const group = data.find((item) => item[0] === 'crab-dvm');
    const expected = sort(['ethereum', 'heco', 'polygon', 'astar', 'crab-dvm', 'darwinia-dvm']);

    expect(group).not.toEqual(undefined);
    expect(sort(uniq(group![1]))).toEqual(sort(expected));

    const overview = getOverview('crab-dvm', 'darwinia');
    expect(overview).toEqual(undefined);
  });

  it('darwinia-dvm contains 3 leafs', () => {
    const group = data.find((item) => item[0] === 'darwinia-dvm');

    expect(group).not.toEqual(undefined);
    expect(sort(uniq(group![1]))).toEqual(sort(['crab-dvm', 'darwinia-dvm', 'ethereum']));
  });

  it('ethereum contains 12 leafs', () => {
    const group = data.find((item) => item[0] === 'ethereum');

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(
      sort([
        'crab-dvm',
        'heco',
        'polygon',
        'bsc',
        'arbitrum',
        'arbitrum',
        'arbitrum',
        'arbitrum',
        'arbitrum',
        'astar',
        'avalanche',
        'optimism',
        'darwinia-dvm',
        'darwinia-dvm',
      ])
    );
  });

  it('heco contains 3 leafs', () => {
    const group = data.find((item) => item[0] === 'heco');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['crab-dvm', 'ethereum', 'polygon']);
  });

  it('bsc contains 6 leafs', () => {
    const group = data.find((item) => item[0] === 'bsc');

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(sort(['arbitrum', 'astar', 'avalanche', 'optimism', 'ethereum', 'polygon']));
  });

  it('arbitrum contains 6 leafs', () => {
    const group = data.find((item) => item[0] === 'arbitrum');

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(
      sort([
        'astar',
        'avalanche',
        'optimism',
        'bsc',
        'ethereum',
        'ethereum',
        'ethereum',
        'ethereum',
        'ethereum',
        'polygon',
      ])
    );
  });

  it('astar contains 7 leafs', () => {
    const group = data.find((item) => item[0] === 'astar');

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(
      sort(['arbitrum', 'avalanche', 'optimism', 'bsc', 'polygon', 'ethereum', 'crab-dvm'])
    );
  });

  it('avalanche contains 6 leafs', () => {
    const group = data.find((item) => item[0] === 'avalanche');

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(sort(['arbitrum', 'astar', 'optimism', 'bsc', 'ethereum', 'polygon']));
  });

  it('optimism contains 6 leafs', () => {
    const group = data.find((item) => item[0] === 'optimism');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['arbitrum', 'astar', 'avalanche', 'bsc', 'ethereum', 'polygon']);
  });

  it('polygon contains 8 leaf', () => {
    const group = data.find((item) => item[0] === 'polygon');

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(
      sort(['crab-dvm', 'ethereum', 'heco', 'bsc', 'arbitrum', 'avalanche', 'astar', 'optimism'])
    );
  });

  it('karura contains 4 leafs', () => {
    const group = data.find((item) => item[0] === 'karura');

    expect(group).not.toEqual(undefined);
    expect(uniq(sort(group![1]))).toEqual(sort(['crab-parachain', 'khala', 'shiden', 'moonriver']));
  });

  it('moonriver contains 4 leafs', () => {
    const group = data.find((item) => item[0] === 'moonriver');

    expect(group).not.toEqual(undefined);
    expect(uniq(group![1])).toEqual(['crab-parachain', 'karura', 'khala', 'shiden']);
  });

  it('khala contains 3 leaf', () => {
    const group = data.find((item) => item[0] === 'khala');

    expect(group).not.toEqual(undefined);
    expect(uniq(sort(group![1]))).toEqual(sort(['karura', 'moonriver', 'shiden']));
  });

  it('shiden contains 3 leafs', () => {
    const group = data.find((item) => item[0] === 'shiden');

    expect(group).not.toEqual(undefined);
    expect(uniq(sort(group![1]))).toEqual(sort(['khala', 'karura', 'moonriver']));
  });

  // ------------------------------------test networks---------------------------------------

  it('goerli contains 2 leaf', () => {
    const group = data.find((item) => item[0] === 'goerli');

    expect(group).not.toEqual(undefined);
    expect(uniq(sort(group![1]))).toEqual(sort(['linea-goerli', 'arbitrum-goerli', 'zksync-goerli', 'mantle-goerli']));
  });

  it('pangoro-dvm contains 0 leafs', () => {
    const group = data.find((item) => item[0] === 'pangoro-dvm');

    expect(group).toEqual(undefined);
  });

  it('can get chain config by chain name', () => {
    chainConfigs.forEach((chain) => {
      const { name } = chain;
      const compared = getChainConfig(name);

      expect(chain).toEqual(compared);
    });
  });

  it('can get origin chain config by chain name', () => {
    SYSTEM_CHAIN_CONFIGURATIONS.forEach((chain) => {
      const { name } = chain;
      const compared = getOriginChainConfig(name);

      expect(chain).toEqual(compared);
    });
  });

  it('can convert display name', () => {
    expect(getDisplayName(crabDVMConfig)).toEqual('Crab');
    expect(getDisplayName(pangolinDVMConfig)).toEqual('Pangolin');
    expect(getDisplayName(pangoroDVMConfig)).toEqual('Pangoro');
    expect(getDisplayName(darwiniaDVMConfig)).toEqual('Darwinia');
    expect(getDisplayName(crabParachainConfig)).toEqual('Crab Parachain');
    expect(getDisplayName(karuraConfig)).toEqual('Karura');
    expect(getDisplayName(astarConfig)).toEqual('Astar');
    expect(getDisplayName(arbitrumConfig)).toEqual('Arbitrum One');
    expect(getDisplayName(avalancheConfig)).toEqual('Avalanche');
    expect(getDisplayName(bscConfig)).toEqual('BNB Chain');
    expect(getDisplayName(optimismConfig)).toEqual('Optimism');
    expect(getDisplayName(moonriverConfig)).toEqual('Moonriver');
    expect(getDisplayName(null)).toEqual('unknown');
  });

  it('can get wrapped token', () => {
    expect(getWrappedToken(pangoroDVMConfig)).toEqual(pangoroDVMConfig.tokens.find((item) => item.symbol === 'WORING'));
    expect(getWrappedToken(darwiniaDVMConfig)).toEqual(
      darwiniaDVMConfig.tokens.find((item) => item.symbol === 'WRING')
    );
  });
});
