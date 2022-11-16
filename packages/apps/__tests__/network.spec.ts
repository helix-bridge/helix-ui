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
  SYSTEM_CHAIN_CONFIGURATIONS,
} from 'shared/config/network';
import { crabParachainConfig } from 'shared/config/network/crab-parachain';
import { pangolinParachainConfig } from 'shared/config/network/pangolin-parachain';
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
  const sort = (ary: string[]) => sortBy(ary, (cur) => cur.charCodeAt(0));
  const getOverview = (departure: Network, arrival: Network) =>
    chainConfigs
      .find((item) => item.name === departure)
      ?.tokens.map((token) => token.cross)
      .flat()
      .find((item) => item.partner.name === arrival);

  it('should contains chains count: ', () => {
    expect(chainConfigs).toHaveLength(21);
  });

  it('crab contains 2 leafs', () => {
    const group = data.find((item) => item[0] === 'crab');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['crab-dvm', 'crab-parachain']);
  });

  it('crab-dvm contains 9 leafs and substrate-substrateDVM deprecated', () => {
    const group = data.find((item) => item[0] === 'crab-dvm');
    const expected = sort([
      'crab',
      'ethereum',
      'heco',
      'polygon',
      'darwinia-dvm',
      'darwinia',
      'astar',
      'crab-dvm',
      'crab-parachain',
    ]);

    expect(group).not.toEqual(undefined);
    expect(sort(uniq(group![1]))).toEqual(sort(expected));

    const overview = getOverview('crab-dvm', 'darwinia');
    expect(overview).toEqual(undefined);
  });

  it('crab-parachain contains 4 leafs', () => {
    const group = data.find((item) => item[0] === 'crab-parachain');
    const expected = sort(['crab', 'karura', 'moonriver', 'crab-dvm']);

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(expected);
  });

  it('darwinia contains 2 leafs and substrate-substrateDVM, ethereum-darwinia deprecated', () => {
    const group = data.find((item) => item[0] === 'darwinia');

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(sort(['darwinia-dvm', 'crab-dvm']));

    const overviewS2sv1 = getOverview('darwinia', 'crab-dvm');
    const overviewE2d = getOverview('darwinia', 'ethereum');

    expect(overviewS2sv1).toEqual(undefined);
    expect(overviewE2d).toEqual(undefined);
  });

  it('darwinia-dvm contains 4 leafs', () => {
    const group = data.find((item) => item[0] === 'darwinia-dvm');

    expect(group).not.toEqual(undefined);
    expect(sort(uniq(group![1]))).toEqual(sort(['darwinia', 'crab-dvm', 'darwinia-dvm', 'ethereum']));
  });

  it('ethereum contains 9 leafs', () => {
    const group = data.find((item) => item[0] === 'ethereum');

    expect(group).not.toEqual(undefined);
    expect(sort(group![1])).toEqual(
      sort(['crab-dvm', 'heco', 'polygon', 'bsc', 'arbitrum', 'astar', 'avalanche', 'optimism', 'darwinia-dvm'])
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
    expect(sort(group![1])).toEqual(sort(['astar', 'avalanche', 'optimism', 'bsc', 'ethereum', 'polygon']));
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

  it('pangolin contains 2 leafs and ethereum-darwinia deprecated', () => {
    const group = data.find((item) => item[0] === 'pangolin');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangolin-dvm', 'pangolin-parachain']);

    const overview = getOverview('pangolin', 'ropsten');

    expect(overview).toEqual(undefined);
  });

  it('pangolin-dvm contains 4 leafs and substrate-substrateDVM deprecated', () => {
    const group = data.find((item) => item[0] === 'pangolin-dvm');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangolin-parachain', 'pangolin', 'pangoro-dvm', 'pangoro']);

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

  it('ropsten contains 0 leaf and ethereum-darwinia deprecated', () => {
    const group = data.find((item) => item[0] === 'ropsten');

    expect(group).toEqual(undefined);

    const overview = getOverview('ropsten', 'pangolin');

    expect(overview).toEqual(undefined);
  });

  it('goerli contains 1 leaf', () => {
    const group = data.find((item) => item[0] === 'goerli');

    expect(group).not.toEqual(undefined);
    expect(group![1]).toEqual(['pangoro-dvm']);
  });

  it('pangoro-dvm contains 3 leafs', () => {
    const group = data.find((item) => item[0] === 'pangoro-dvm');

    expect(group).not.toEqual(undefined);
    expect(uniq(sort(group![1]))).toEqual(sort(['pangolin-dvm', 'goerli', 'pangoro-dvm']));
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

  it('can get wrapped token', () => {
    expect(getWrappedToken(pangoroDVMConfig)).toEqual(pangoroDVMConfig.tokens.find((item) => item.symbol === 'WORING'));
    expect(getWrappedToken(darwiniaDVMConfig)).toEqual(
      darwiniaDVMConfig.tokens.find((item) => item.symbol === 'WRING')
    );
  });
});
