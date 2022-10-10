/// <reference types="jest" />

import isEqual from 'lodash/isEqual';
import unionWith from 'lodash/unionWith';
import { BridgeBase } from 'shared/core/bridge';
import { ChainConfig, CrossToken, Network } from 'shared/model';
import { toMiddleSplitNaming } from 'shared/utils/helper/common';
import { isDVMNetwork, isParachainNetwork, isPolkadotNetwork } from 'shared/utils/network/network';
import { BRIDGES } from '../bridges/bridges';
import { unknownUnavailable } from '../bridges/unknown-unavailable/utils/bridge';
import { bridgeCategoryDisplay, getBridge, getBridges } from '../utils/bridge';
import { chainConfigs, genCrossChainGraph, getChainConfig } from '../utils/network/network';

// exclude the config that not contains transferable tokens;
const configs = chainConfigs.filter((item) => !!item.tokens.filter((token) => !!token.cross.length).length);

const calcBridgesAmount = (data: [Network, Network[]][]) =>
  unionWith(
    data.map(([from, tos]) => tos.map((to) => [from, to])).flat(),
    (pre, cur) => isEqual(pre, cur) || isEqual(pre.reverse(), cur)
  );

describe('bridge utils', () => {
  const bridges = genCrossChainGraph(BRIDGES);
  const formalBridges = calcBridgesAmount(bridges.filter((item) => !getChainConfig(item[0]).isTest));
  const testBridges = calcBridgesAmount(bridges.filter((item) => getChainConfig(item[0]).isTest));

  const allDirections = bridges.map(([departure, arrivals]) => arrivals.map((arrival) => [departure, arrival])).flat();
  console.log('🌉 All cross-chain directions to be tested', allDirections);

  it('should support bridge count: ', () => {
    expect(testBridges).toHaveLength(6);
    expect(formalBridges).toHaveLength(35);
  });

  it('should support transfer count: ', () => {
    expect(allDirections).toHaveLength(82);
  });

  it('Should correct bridge category name', () => {
    expect(bridgeCategoryDisplay('helix')).toBe('Helix');
    expect(bridgeCategoryDisplay('cBridge')).toBe('cBridge');
  });

  it.each(allDirections.map(([departure, arrival]) => ({ departure, arrival })))(
    'could find bridge by $departure and $arrival',
    ({ departure, arrival }) => {
      const byNetwork = getBridge([departure, arrival] as [Network, Network]);
      const byConfig = getBridge([getChainConfig(departure as Network), getChainConfig(arrival as Network)]);
      const mixes = getBridge([getChainConfig(departure as Network), arrival as Network]);
      const mixes2 = getBridge([departure as Network, getChainConfig(arrival as Network)]);

      expect(byNetwork).toBeInstanceOf(BridgeBase);
      expect(byNetwork).not.toEqual(unknownUnavailable);
      expect(byConfig).toBeInstanceOf(BridgeBase);
      expect(byConfig).not.toEqual(unknownUnavailable);
      expect(mixes).toBeInstanceOf(BridgeBase);
      expect(mixes).not.toEqual(unknownUnavailable);
      expect(mixes2).toBeInstanceOf(BridgeBase);
      expect(mixes2).not.toEqual(unknownUnavailable);
    }
  );
});

/**
 * Test whether the token transfer configuration of the bridge is correct;
 */
describe.each(configs)("$name network's ", ({ name, tokens, ...other }) => {
  describe.each(tokens.filter((item) => !!item.cross.length))('$name token', ({ cross, name: tokenName, ...rest }) => {
    const from = { ...rest, name: tokenName, cross, meta: { name, tokens, ...other }, amount: '' };

    const bridgeCountStatistics = cross.reduce((acc, cur) => {
      const target = acc.find((item) => item.toNetwork === cur.partner.name && item.toSymbol == cur.partner.symbol);

      if (!target) {
        acc.push({ toNetwork: cur.partner.name, toSymbol: cur.partner.symbol, count: 1 });
      } else {
        target.count += 1;
      }

      return acc;
    }, [] as { toNetwork: string; toSymbol: string; count: number }[]);

    it(`host name must consistent with the config name`, () => {
      expect(rest.host).toEqual(name);
    });

    it.each(bridgeCountStatistics)(
      `to $toNetwork's $toSymbol should have $count bridges`,
      ({ toNetwork, toSymbol, count }) => {
        const meta = getChainConfig(toNetwork as Network);
        const toConfig = meta.tokens.find(
          (item) => item.symbol === toSymbol && item.cross.find((cross) => cross.partner.name === from.meta.name)
        );

        expect(toConfig).not.toBeUndefined();

        const to = { ...toConfig, meta, amount: '' } as unknown as CrossToken<ChainConfig>;
        const bridges = getBridges({ from, to });

        expect(bridges).toHaveLength(count);
      }
    );

    it.each(cross.map((item) => item.partner).flat())(
      '$symbol must be exist on the $name chain',
      ({ symbol, name }) => {
        const config = getChainConfig(name);
        const target = config.tokens.find((item) => item.symbol === symbol);

        expect(target).not.toBeUndefined();
      }
    );

    /**
     * e.g.
     * For USDT transfer on crabDVM-astar bridge, crab-dvm must contains USDT token, and the cross role of partner must be issuing.
     * In turn, astar must contains USDT too, and it's cross role of partner must be backing.
     */
    it.each(cross)('role should be set consistent with the bridge naming - $bridge', ({ bridge, partner }) => {
      const [backing, issuing] = bridge.split('-').map((chain) => toMiddleSplitNaming(chain));

      if (bridge === 'ethereum-darwinia') {
        if (other.isTest) {
          expect(from.host).toEqual(partner.role === 'backing' ? 'pangolin' : 'ropsten');
        } else {
          expect(from.host).toEqual(partner.role === 'backing' ? issuing : backing);
        }
      } else if (bridge === 'substrateDVM-ethereum') {
        if (other.isTest) {
          expect(from.host).toEqual(partner.role === 'backing' ? 'goerli' : 'pangoro-dvm');
        } else {
          expect(from.host).toEqual(partner.role === 'backing' ? 'ethereum' : 'darwinia-dvm');
        }
      } else if (partner.role === 'backing') {
        if (issuing === 'substrate') {
          expect(isPolkadotNetwork(from.host)).toBe(true);
        } else if (issuing === 'dvm' || issuing === 'substrate-dvm') {
          expect(isDVMNetwork(from.host)).toBe(true);
        } else if (issuing === 'substrate-parachain') {
          expect(isParachainNetwork(from.host)).toBe(true);
        } else {
          expect(from.host).toEqual(issuing);
        }
      } else {
        if (backing === 'substrate') {
          expect(isPolkadotNetwork(from.host)).toBe(true);
        } else if (backing === 'dvm' || backing === 'substrate-dvm') {
          expect(isDVMNetwork(from.host)).toBe(true);
        } else if (backing === 'substrate-parachain') {
          expect(isParachainNetwork(from.host)).toBe(true);
        } else {
          expect(from.host).toEqual(backing);
        }
      }
    });
  });
});
