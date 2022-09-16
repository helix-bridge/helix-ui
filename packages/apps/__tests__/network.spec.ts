/// <reference types="jest" />

import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import {
  arbitrumConfig,
  astarConfig,
  avalancheConfig,
  bscConfig,
  crabConfig,
  crabDVMConfig,
  darwiniaDVMConfig,
  karuraConfig,
  moonriverConfig,
  optimismConfig,
  pangolinDVMConfig,
  pangoroDVMConfig,
} from 'shared/config/network';
import { crabParachainConfig } from 'shared/config/network/crab-parachain';
import { pangolinParachainConfig } from 'shared/config/network/pangolin-parachain';
import { Network } from 'shared/model';
import { crossChainGraph } from '../utils/network/graph';
import { chainConfigs, getChainConfig, getDisplayName, getOriginChainConfig } from '../utils/network/network';

describe('network utils', () => {
  const data = [...crossChainGraph];
  const sort = (ary: string[]) => sortBy(ary, (cur) => cur.charCodeAt(0));
  const getOverview = (departure: Network, arrival: Network) =>
    chainConfigs
      .find((item) => item.name === departure)
      ?.tokens.map((token) => token.cross)
      .flat()
      .find((item) => item.partner.name === arrival);

  it('should contains chains count: ', () => {
    expect(chainConfigs).toHaveLength(22);
  });

  it('crab contains 2 leafs', () => {
    const group = data.find((item) => item[0] === 'crab');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['crab-dvm', 'crab-parachain']);
  });

  it('crab-dvm contains 7 leafs and substrate-substrateDVM deprecated', () => {
    const group = data.find((item) => item[0] === 'crab-dvm');
    const expected = sort(['crab', 'ethereum', 'heco', 'polygon', 'darwinia', 'darwinia-dvm', 'astar']);

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(expected);

    const overview = getOverview('crab-dvm', 'darwinia');
    expect(overview).toEqual(undefined);
  });

  it('crab-parachain contains 3 leafs', () => {
    const group = data.find((item) => item[0] === 'crab-parachain');
    const expected = sort(['crab', 'karura', 'moonriver']);

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(expected);
  });

  it('darwinia contains 3 leafs and substrate-substrateDVM deprecated', () => {
    const group = data.find((item) => item[0] === 'darwinia');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['darwinia-dvm', 'crab-dvm', 'ethereum']);

    const overview = getOverview('darwinia', 'crab-dvm');

    expect(overview).toEqual(undefined);
  });

  it('darwinia-dvm contains 3 leafs', () => {
    const group = data.find((item) => item[0] === 'darwinia-dvm');

    expect(group).not.toEqual(undefined);
    expect(uniq(group![1])).toEqual(['darwinia', 'crab-dvm', 'darwinia-dvm']);
  });

  it('ethereum contains 9 leafs', () => {
    const group = data.find((item) => item[0] === 'ethereum');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual([
      'crab-dvm',
      'darwinia',
      'heco',
      'polygon',
      'astar',
      'bsc',
      'avalanche',
      'arbitrum',
      'optimism',
    ]);
  });

  it('heco contains 3 leafs', () => {
    const group = data.find((item) => item[0] === 'heco');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['crab-dvm', 'ethereum', 'polygon']);
  });

  it('bsc contains 6 leafs', () => {
    const group = data.find((item) => item[0] === 'bsc');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['arbitrum', 'astar', 'avalanche', 'optimism', 'ethereum', 'polygon']);
  });

  it('arbitrum contains 6 leafs', () => {
    const group = data.find((item) => item[0] === 'arbitrum');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['astar', 'avalanche', 'optimism', 'bsc', 'ethereum', 'polygon']);
  });

  it('astar contains 7 leafs', () => {
    const group = data.find((item) => item[0] === 'astar');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['arbitrum', 'avalanche', 'optimism', 'bsc', 'polygon', 'ethereum', 'crab-dvm']);
  });

  it('avalanche contains 6 leafs', () => {
    const group = data.find((item) => item[0] === 'avalanche');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['arbitrum', 'astar', 'optimism', 'bsc', 'ethereum', 'polygon']);
  });

  it('optimism contains 6 leafs', () => {
    const group = data.find((item) => item[0] === 'optimism');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['arbitrum', 'astar', 'avalanche', 'bsc', 'ethereum', 'polygon']);
  });

  it('polygon contains 8 leaf', () => {
    const group = data.find((item) => item[0] === 'polygon');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['crab-dvm', 'ethereum', 'heco', 'astar', 'bsc', 'avalanche', 'arbitrum', 'optimism']);
  });

  it('karura contains 1 leaf', () => {
    const group = data.find((item) => item[0] === 'karura');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['crab-parachain']);
  });

  it('moonriver contains 1 leaf', () => {
    const group = data.find((item) => item[0] === 'moonriver');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['crab-parachain']);
  });

  // ------------------------------------test networks---------------------------------------

  it('pangolin contains 3 leafs', () => {
    const group = data.find((item) => item[0] === 'pangolin');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangolin-dvm', 'pangolin-parachain', 'ropsten']);
  });

  it('pangolin-dvm contains 3 leafs and substrate-substrateDVM deprecated', () => {
    const group = data.find((item) => item[0] === 'pangolin-dvm');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangolin', 'pangoro-dvm', 'pangoro']);

    const overview = getOverview('pangolin-dvm', 'pangoro');

    expect(overview).toEqual(undefined);
  });

  it('pangoro contains 1 leaf and substrate-substrateDVM deprecated', () => {
    const group = data.find((item) => item[0] === 'pangoro');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangolin-dvm']);

    const overview = getOverview('pangoro', 'pangolin-dvm');

    expect(overview).toEqual(undefined);
  });

  it('ropsten contains 1 leaf', () => {
    const group = data.find((item) => item[0] === 'ropsten');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangolin']);
  });

  it('goerli contains 1 leaf', () => {
    const group = data.find((item) => item[0] === 'goerli');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangoro-dvm']);
  });

  it('pangoro-dvm contains 2 leafs', () => {
    const group = data.find((item) => item[0] === 'pangoro-dvm');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangolin-dvm', 'goerli']);
  });

  it('can get chain config by chain name', () => {
    chainConfigs.forEach((chain) => {
      const { name } = chain;
      const compared = getChainConfig(name);

      expect(chain).toEqual(compared);
    });
  });

  it('can get origin chain config that contains deprecated bridges', () => {
    const result = getOriginChainConfig('crab-dvm');
    const target = result.tokens.find((it) => it.symbol === 'xRING');

    expect(target?.cross.length).toEqual(4);
    expect(target?.cross.find((item) => item.bridge === 'substrate-substrateDVM')).not.toBeUndefined();
  });

  it('can convert display name', () => {
    expect(getDisplayName(crabConfig)).toEqual('Crab Chain');
    expect(getDisplayName(crabDVMConfig)).toEqual('Crab Smart Chain');
    expect(getDisplayName(pangolinDVMConfig)).toEqual('Pangolin Smart Chain');
    expect(getDisplayName(pangoroDVMConfig)).toEqual('Pangoro Smart Chain');
    expect(getDisplayName(darwiniaDVMConfig)).toEqual('Darwinia Smart Chain');
    expect(getDisplayName(crabParachainConfig)).toEqual('Crab Parachain');
    expect(getDisplayName(pangolinParachainConfig)).toEqual('Pangolin Parachain');
    expect(getDisplayName(karuraConfig)).toEqual('Karura');
    expect(getDisplayName(astarConfig)).toEqual('Astar');
    expect(getDisplayName(arbitrumConfig)).toEqual('Arbitrum One');
    expect(getDisplayName(avalancheConfig)).toEqual('Avalanche');
    expect(getDisplayName(bscConfig)).toEqual('BNB Chain');
    expect(getDisplayName(optimismConfig)).toEqual('Optimism');
    expect(getDisplayName(moonriverConfig)).toEqual('Moonriver');
    expect(getDisplayName(null)).toEqual('unknown');
  });
});
