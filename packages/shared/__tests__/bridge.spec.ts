/// <reference types="jest" />

import { chain, isEqual } from 'lodash';
import { crabConfig, crabDVMConfig, darwiniaConfig, ethereumConfig } from '../config/network';
import { ChainConfig, Network, TokenWithBridgesInfo } from '../model';
import {
  BridgePredicateFn,
  getBridges,
  isArbitrum2Astar,
  isArbitrum2Avalanche,
  isArbitrum2BSC,
  isArbitrum2Optimism,
  isArbitrumAstar,
  isArbitrumAvalanche,
  isArbitrumOptimism,
  isAstar2Arbitrum,
  isAstar2Avalanche,
  isAstar2BSC,
  isAstar2Optimism,
  isAstarAvalanche,
  isAstarOptimism,
  isAvalanche2Arbitrum,
  isAvalanche2Astar,
  isAvalanche2BSC,
  isAvalanche2Optimism,
  isAvalancheOptimism,
  isBSC2Astar,
  isBSC2Avalanche,
  isBSC2Optimism,
  isBSCAstar,
  isBSCAvalanche,
  isBSC2Arbitrum,
  isBSCArbitrum,
  isBSCOptimism,
  isCrabDVM2Ethereum,
  isCrabDVM2Heco,
  isCrabDVM2Polygon,
  isCrabDVMEthereum,
  isCrabDVMHeco,
  isCrabDVMPolygon,
  isDarwinia2Ethereum,
  isDVM2Substrate,
  isEthereum2CrabDVM,
  isEthereum2Darwinia,
  isEthereum2Heco,
  isEthereum2Polygon,
  isEthereumDarwinia,
  isEthereumHeco,
  isEthereumPolygon,
  isHeco2CrabDVM,
  isHeco2Ethereum,
  isOptimism2Arbitrum,
  isOptimism2Astar,
  isOptimism2Avalanche,
  isOptimism2BSC,
  isPolygon2CrabDVM,
  isPolygon2Ethereum,
  isSubstrate2DVM,
  isSubstrate2SubstrateDVM,
  isSubstrateDVM,
  isSubstrateDVM2Substrate,
  isSubstrateSubstrateDVM,
} from '../utils/bridge';
import { crossChainGraph, getChainConfig } from '../utils/network';

const calcBridgesAmount = (data: [Network, Network[]][]) =>
  chain(data)
    .map(([from, tos]) => tos.map((to) => [from, to]))
    .flatten()
    .unionWith((pre, cur) => isEqual(pre, cur) || isEqual(pre.reverse(), cur))
    .value();

const testsCrosses: [[Network, Network][], BridgePredicateFn, BridgePredicateFn, BridgePredicateFn, string][] = [
  [
    [
      ['crab', 'crab-dvm'],
      ['darwinia', 'darwinia-dvm'],
      ['pangolin', 'pangolin-dvm'],
    ],
    isSubstrate2DVM,
    isDVM2Substrate,
    isSubstrateDVM,
    'substrate <-> DVM',
  ],
  [
    [
      ['pangoro', 'pangolin-dvm'],
      ['darwinia', 'crab-dvm'],
    ],
    isSubstrate2SubstrateDVM,
    isSubstrateDVM2Substrate,
    isSubstrateSubstrateDVM,
    'substrate <-> substrateDVM',
  ],
  [
    [
      ['ethereum', 'darwinia'],
      ['ropsten', 'pangolin'],
    ],
    isEthereum2Darwinia,
    isDarwinia2Ethereum,
    isEthereumDarwinia,
    'ethereum <-> darwinia',
  ],
  [[['crab-dvm', 'heco']], isCrabDVM2Heco, isHeco2CrabDVM, isCrabDVMHeco, 'crabDVM <-> heco'],
  [[['crab-dvm', 'polygon']], isCrabDVM2Polygon, isPolygon2CrabDVM, isCrabDVMPolygon, 'crabDVM <-> polygon'],
  [[['crab-dvm', 'ethereum']], isCrabDVM2Ethereum, isEthereum2CrabDVM, isCrabDVMEthereum, 'crabDVM <-> ethereum'],
  [[['ethereum', 'heco']], isEthereum2Heco, isHeco2Ethereum, isEthereumHeco, 'ethereum <-> heco'],
  [[['ethereum', 'polygon']], isEthereum2Polygon, isPolygon2Ethereum, isEthereumPolygon, 'ethereum <-> polygon'],
  [[['bsc', 'arbitrum']], isBSC2Arbitrum, isArbitrum2BSC, isBSCArbitrum, 'bsc <-> arbitrum'],
  [[['bsc', 'astar']], isBSC2Astar, isAstar2BSC, isBSCAstar, 'bsc <-> astar'],
  [[['bsc', 'avalanche']], isBSC2Avalanche, isAvalanche2BSC, isBSCAvalanche, 'bsc <-> avalanche'],
  [[['bsc', 'optimism']], isBSC2Optimism, isOptimism2BSC, isBSCOptimism, 'bsc <-> optimism'],
  [[['arbitrum', 'astar']], isArbitrum2Astar, isAstar2Arbitrum, isArbitrumAstar, 'arbitrum <-> astar'],
  [
    [['arbitrum', 'avalanche']],
    isArbitrum2Avalanche,
    isAvalanche2Arbitrum,
    isArbitrumAvalanche,
    'arbitrum <-> avalanche',
  ],
  [[['arbitrum', 'optimism']], isArbitrum2Optimism, isOptimism2Arbitrum, isArbitrumOptimism, 'arbitrum <-> optimism'],
  [[['astar', 'avalanche']], isAstar2Avalanche, isAvalanche2Astar, isAstarAvalanche, 'astar <-> avalanche'],
  [[['astar', 'optimism']], isAstar2Optimism, isOptimism2Astar, isAstarOptimism, 'astar <-> optimism'],
  [
    [['avalanche', 'optimism']],
    isAvalanche2Optimism,
    isOptimism2Avalanche,
    isAvalancheOptimism,
    'avalanche <-> optimism',
  ],
];

describe('bridge utils', () => {
  function findBySymbol(config: ChainConfig, symbol: string): TokenWithBridgesInfo {
    return config.tokens.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase())!;
  }

  const allDirections = crossChainGraph
    .map(([departure, arrivals]) => arrivals.map((arrival) => [departure, arrival]))
    .flat();

  const formatFactory = (direction: Network[]) => (item: Network[]) => item.join('->') === direction.join('->');

  console.log('🌉 All cross-chain directions to be tested', allDirections);

  it('should support bridge count: ', () => {
    const tests = crossChainGraph.filter((item) => getChainConfig(item[0]).isTest);
    const testBridges = calcBridgesAmount(tests);
    const formals = crossChainGraph.filter((item) => !getChainConfig(item[0]).isTest);
    const formalBridges = calcBridgesAmount(formals);

    expect(testBridges).toHaveLength(5);
    expect(formalBridges).toHaveLength(38);
  });

  it('should support transfer count: ', () => {
    expect(allDirections).toHaveLength(86);
  });

  // TODO: fix it to check all bridges
  it('should get bridges correctly', () => {
    const crab2DVM = {
      from: { ...findBySymbol(crabConfig, 'crab'), meta: crabConfig, amount: '' },
      to: { ...findBySymbol(crabDVMConfig, 'crab'), meta: crabDVMConfig, amount: '' },
    };

    const darwinia2DVM = {
      from: { ...findBySymbol(crabConfig, 'crab'), meta: crabConfig, amount: '' },
      to: { ...findBySymbol(crabDVMConfig, 'crab'), meta: crabDVMConfig, amount: '' },
    };

    const s2s = {
      from: { ...findBySymbol(darwiniaConfig, 'ring'), meta: darwiniaConfig, amount: '' },
      to: { ...findBySymbol(crabDVMConfig, 'xRing'), meta: crabDVMConfig, amount: '' },
    };

    const e2d = {
      from: { ...findBySymbol(ethereumConfig, 'ring'), meta: ethereumConfig, amount: '' },
      to: { ...findBySymbol(darwiniaConfig, 'ring'), meta: darwiniaConfig, amount: '' },
    };

    const crab2CrabDVM = getBridges(crab2DVM);
    const darwinia2DarwiniaDVM = getBridges(darwinia2DVM);
    const substrate2Substrate = getBridges(s2s);
    const ethereum2Darwinia = getBridges(e2d);

    expect(crab2CrabDVM).toHaveLength(1);
    expect(darwinia2DarwiniaDVM).toHaveLength(1);
    expect(substrate2Substrate).toHaveLength(1);
    expect(ethereum2Darwinia).toHaveLength(1);
  });

  describe.each(testsCrosses)(`test cross-chain predicate fn`, (directions, isIssuing, isRedeem, isCross, name) => {
    const revertDirs = directions.map((item) => [...item].reverse());

    it.each(allDirections)(`should recognize cross-chain ${name}`, (from, to) => {
      const formatter = formatFactory([from, to]);
      const go = !!directions.find(formatter);
      const back = !!revertDirs.find(formatter);
      const directionInsensitive = !![...directions, ...revertDirs].find(formatter);

      expect(isIssuing(from, to)).toBe(go);
      expect(isRedeem(from, to)).toBe(back);
      expect(isCross(from, to)).toBe(directionInsensitive);
    });
  });
});
