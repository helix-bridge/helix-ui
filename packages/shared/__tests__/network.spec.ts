/// <reference types="jest" />

import { sortBy } from 'lodash';
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
} from '../config/network';
import { crabParachainConfig } from '../config/network/crab-parachain';
import { pangolinParachainConfig } from '../config/network/pangolin-parachain';
import { crossChainGraph } from '../utils/network/graph';
import {
  chainConfigs,
  getChainConfig,
  getDisplayName,
  isDVMNetwork,
  isEthereumNetwork,
  isParachainNetwork,
  isPolkadotNetwork,
} from '../utils/network/network';

describe('network utils', () => {
  const data = [...crossChainGraph];
  const sort = (ary: string[]) => sortBy(ary, (cur) => cur.charCodeAt(0));

  it('should contains chains count: ', () => {
    expect(chainConfigs).toHaveLength(21);
  });

  it('crab contains 2 leafs', () => {
    const group = data.find((item) => item[0] === 'crab');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['crab-dvm', 'crab-parachain']);
  });

  it('crab-dvm contains 11 leafs', () => {
    const group = data.find((item) => item[0] === 'crab-dvm');
    const expected = sort([
      'crab',
      'ethereum',
      'heco',
      'polygon',
      'darwinia',
      'darwinia-dvm',
      'arbitrum',
      'astar',
      'avalanche',
      'bsc',
      'optimism',
    ]);

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(expected);
  });

  it('crab-parachain contains 3 leafs', () => {
    const group = data.find((item) => item[0] === 'crab-parachain');
    const expected = sort(['crab', 'karura', 'moonriver']);

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(expected);
  });

  it('darwinia contains 3 leafs', () => {
    const group = data.find((item) => item[0] === 'darwinia');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['crab-dvm', 'darwinia-dvm', 'ethereum']);
  });

  it('darwinia-dvm contains 2 leafs', () => {
    const group = data.find((item) => item[0] === 'darwinia-dvm');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['darwinia', 'crab-dvm']);
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

  it('bsc contains 7 leafs', () => {
    const group = data.find((item) => item[0] === 'bsc');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['arbitrum', 'astar', 'avalanche', 'optimism', 'ethereum', 'polygon', 'crab-dvm']);
  });

  it('arbitrum contains 7 leafs', () => {
    const group = data.find((item) => item[0] === 'arbitrum');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['astar', 'avalanche', 'optimism', 'bsc', 'ethereum', 'polygon', 'crab-dvm']);
  });

  it('astar contains 7 leafs', () => {
    const group = data.find((item) => item[0] === 'astar');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['arbitrum', 'avalanche', 'optimism', 'bsc', 'polygon', 'ethereum', 'crab-dvm']);
  });

  it('avalanche contains 7 leafs', () => {
    const group = data.find((item) => item[0] === 'avalanche');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['arbitrum', 'astar', 'optimism', 'bsc', 'ethereum', 'polygon', 'crab-dvm']);
  });

  it('optimism contains 7 leafs', () => {
    const group = data.find((item) => item[0] === 'optimism');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['arbitrum', 'astar', 'avalanche', 'bsc', 'ethereum', 'polygon', 'crab-dvm']);
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

  it('pangolin-dvm contains 3 leafs', () => {
    const group = data.find((item) => item[0] === 'pangolin-dvm');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangolin', 'pangoro-dvm', 'pangoro']);
  });

  it('pangoro contains 1 leaf', () => {
    const group = data.find((item) => item[0] === 'pangoro');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangolin-dvm']);
  });

  it('ropsten contains 1 leaf', () => {
    const group = data.find((item) => item[0] === 'ropsten');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangolin']);
  });

  it('pangoro-dvm contains 1 leaf', () => {
    const group = data.find((item) => item[0] === 'pangoro-dvm');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangolin-dvm']);
  });

  it('can get chain config by chain name', () => {
    chainConfigs.forEach((chain) => {
      const { name } = chain;
      const compared = getChainConfig(name);

      expect(chain).toEqual(compared);
    });
  });

  it('can recognize polkadot network', () => {
    expect(isPolkadotNetwork('crab')).toBe(true);
    expect(isPolkadotNetwork('darwinia')).toBe(true);
    expect(isPolkadotNetwork('pangolin')).toBe(true);
    expect(isPolkadotNetwork('pangoro')).toBe(true);
    expect(isPolkadotNetwork('pangolin-parachain')).toBe(true);
    expect(isPolkadotNetwork('crab-parachain')).toBe(true);
    expect(isPolkadotNetwork('karura')).toBe(true);
    expect(isPolkadotNetwork('moonriver')).toBe(false);
  });

  it('can recognize parachain network', () => {
    expect(isParachainNetwork('pangolin-parachain')).toBe(true);
    expect(isParachainNetwork('crab-parachain')).toBe(true);
    expect(isParachainNetwork('karura')).toBe(true);
    expect(isParachainNetwork('moonriver')).toBe(true);
  });

  it('can recognize ethereum network', () => {
    expect(isEthereumNetwork('ethereum')).toBe(true);
    expect(isEthereumNetwork('ropsten')).toBe(true);
    expect(isEthereumNetwork('crab-dvm')).toBe(true);
    expect(isEthereumNetwork('pangolin-dvm')).toBe(true);
    expect(isEthereumNetwork('heco')).toBe(true);
    expect(isEthereumNetwork('polygon')).toBe(true);
    expect(isEthereumNetwork('pangoro-dvm')).toBe(true);
    expect(isEthereumNetwork('moonriver')).toBe(true);
  });

  it('can recognize dvm network', () => {
    expect(isDVMNetwork('crab-dvm')).toBe(true);
    expect(isDVMNetwork('pangolin-dvm')).toBe(true);
    expect(isDVMNetwork('pangoro-dvm')).toBe(true);
    expect(isDVMNetwork('darwinia-dvm')).toBe(true);
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
