/// <reference types="jest" />

import { chain, isEqual } from 'lodash';
import { unknownUnavailable } from '../config/bridges/unknown-unavailable';
import { Bridge, Network } from '../model';
import {
  BridgePredicateFn,
  getBridge,
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
  isBSC2Arbitrum,
  isBSC2Astar,
  isBSC2Avalanche,
  isBSC2Optimism,
  isBSCArbitrum,
  isBSCAstar,
  isBSCAvalanche,
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
import { chainConfigs, crossChainGraph, getChainConfig } from '../utils/network';

const calcBridgesAmount = (data: [Network, Network[]][]) =>
  chain(data)
    .map(([from, tos]) => tos.map((to) => [from, to]))
    .flatten()
    .unionWith((pre, cur) => isEqual(pre, cur) || isEqual(pre.reverse(), cur))
    .value();

const allDirections = crossChainGraph
  .map(([departure, arrivals]) => arrivals.map((arrival) => [departure, arrival]))
  .flat();

describe('bridge utils', () => {
  console.log('🌉 All cross-chain directions to be tested', allDirections);

  it('should support bridge count: ', () => {
    const tests = crossChainGraph.filter((item) => getChainConfig(item[0]).isTest);
    const testBridges = calcBridgesAmount(tests);
    const formals = crossChainGraph.filter((item) => !getChainConfig(item[0]).isTest);
    const formalBridges = calcBridgesAmount(formals);

    expect(testBridges).toHaveLength(5);
    expect(formalBridges).toHaveLength(35);
  });

  it('should support transfer count: ', () => {
    expect(allDirections).toHaveLength(80);
  });

  describe.each(chainConfigs)("$name network's ", ({ name, tokens, ...other }) => {
    describe.each(tokens.filter((item) => !!item.cross.length))(
      '$name token',
      ({ cross, name: tokenName, ...rest }) => {
        const from = { ...rest, name: tokenName, cross, meta: { name, tokens, ...other }, amount: '' };

        const bridgeStatistics = cross.reduce((acc, cur) => {
          const target = acc.find((item) => item.toNetwork === cur.partner.name);

          if (!target) {
            acc.push({ toNetwork: cur.partner.name, toSymbol: cur.partner.symbol, count: 1 });
          } else {
            target.count += 1;
          }

          return acc;
        }, [] as { toNetwork: string; toSymbol: string; count: number }[]);

        it.each(bridgeStatistics)(
          "to $toNetwork's $toSymbol should have $count bridges",
          ({ toNetwork, toSymbol, count }) => {
            const meta = getChainConfig(toNetwork as Network);
            const to = { ...meta.tokens.find((item) => item.symbol === toSymbol)!, meta, amount: '' };

            expect(getBridges({ from, to })).toHaveLength(count);
            expect(getBridge({ from, to })).toBeInstanceOf(Bridge);
          }
        );
      }
    );
  });

  it.each(allDirections.map(([departure, arrival]) => ({ departure, arrival })))(
    'could find bridge by $departure and $arrival',
    ({ departure, arrival }) => {
      const byNetwork = getBridge([departure, arrival] as [Network, Network]);
      const byConfig = getBridge([getChainConfig(departure as Network), getChainConfig(arrival as Network)]);
      const mixes = getBridge([getChainConfig(departure as Network), arrival as Network]);
      const mixes2 = getBridge([departure as Network, getChainConfig(arrival as Network)]);

      expect(byNetwork).toBeInstanceOf(Bridge);
      expect(byNetwork).not.toEqual(unknownUnavailable);
      expect(byConfig).toBeInstanceOf(Bridge);
      expect(byConfig).not.toEqual(unknownUnavailable);
      expect(mixes).toBeInstanceOf(Bridge);
      expect(mixes).not.toEqual(unknownUnavailable);
      expect(mixes2).toBeInstanceOf(Bridge);
      expect(mixes2).not.toEqual(unknownUnavailable);
    }
  );
});
