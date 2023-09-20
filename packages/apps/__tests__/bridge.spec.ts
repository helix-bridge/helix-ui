/// <reference types="jest" />

import isEqual from 'lodash/isEqual';
import unionWith from 'lodash/unionWith';
import { ChainConfig, CrossToken, Network } from 'shared/model';
import { toMiddleSplitNaming } from 'shared/utils/helper/common';
import { isDVMNetwork, isParachainNetwork, isPolkadotNetwork } from 'shared/utils/network/network';
import { bridgeCategoryDisplay, getBridge, getBridges } from '../utils/bridge';
import { chainConfigs, crossChainGraph, getChainConfig } from '../utils/network/network';

// exclude the config that not contains transferable tokens;
const configs = chainConfigs.filter((item) => !!item.tokens.filter((token) => !!token.cross.length).length);

// e.g. crabDVM<>darwiniaDVM and darwiniaDVM<>crabDVM should be different two bridges
const dualBridges: [Network, Network][] = [
  ['crab-dvm', 'darwinia-dvm'],
  ['shiden', 'khala'],
  ['shiden', 'karura'],
  ['shiden', 'moonriver'],
  ['karura', 'moonriver'],
  ['karura', 'khala'],
  ['moonriver', 'khala'],
];

const calcBridgesAmount = (data: [Network, Network[]][]) =>
  unionWith(data.map(([from, tos]) => tos.map((to) => [from, to])).flat(), (pre, cur) => {
    if (dualBridges.find((item) => isEqual(item, cur) || isEqual(item.reverse(), cur))) {
      return isEqual(pre.reverse(), cur);
    }

    return isEqual(pre, cur) || isEqual(pre.reverse(), cur);
  });

const mapToTestChain: { [key: string]: string } = {
  'darwinia-dvm': 'pangoro-dvm',
  'crab-dvm': 'pangolin-dvm',
  ethereum: 'goerli',
  arbitrum: 'arbitrum-goerli',
  zksync: 'zksync-goerli',
  linea: 'linea-goerli',
  mantle: 'mantle-goerli',
};

// describe.skip('bridge utils', () => {
//   const bridges = crossChainGraph;

//   const formalBridges = calcBridgesAmount(bridges.filter((item) => !getChainConfig(item[0]).isTest));
//   const testBridges = calcBridgesAmount(bridges.filter((item) => getChainConfig(item[0]).isTest));

//   const allDirections = bridges.map(([departure, arrivals]) => arrivals.map((arrival) => [departure, arrival])).flat();
//   console.log('🌉 All cross-chain directions to be tested', allDirections);

//   it('should support bridge count: ', () => {
//     expect(testBridges).toHaveLength(9);
//     expect(formalBridges).toHaveLength(47);
//   });

//   it('should support transfer count: ', () => {
//     expect(allDirections).toHaveLength(144);
//   });

//   it('Should correct bridge category name', () => {
//     expect(bridgeCategoryDisplay('helix')).toBe('Helix');
//     expect(bridgeCategoryDisplay('cBridge')).toBe('cBridge');
//   });
// });

/**
 * Test getBridge function
 */
describe.skip.each(configs.filter((item) => !item.isTest))(
  "can find bridge which from $name's",
  ({ tokens, name: chainName, ...restChainConfigs }) => {
    describe.each(tokens.filter((item) => !!item.cross.length))(
      '$name token',
      ({ cross, name: tokenName, ...restTokenConfigs }) => {
        const fromToken = {
          cross,
          name: tokenName,
          ...restTokenConfigs,
          meta: { tokens, name: chainName, ...restChainConfigs },
        };

        it.each(cross)(
          "to $partner.name's $partner.symbol token with name $bridge",
          ({ partner: { name, symbol, role }, bridge, category }) => {
            const meta = configs.find((item) => item.name === name)!;
            const token = meta.tokens.find((item) => item.symbol === symbol)!;
            const toToken = { ...token, meta };
            const target = getBridge({ from: fromToken, to: toToken }, category);

            expect(target.name).toEqual(bridge);

            //Some common bridge's name may be not flow the rules below
            //e.g. darwinia-darwiniaDVM actually is substrate-DVM
            // const toCamelCase = (str: string) => {
            //   const [head, ...rest] = str.split('-');

            //   return head + rest.map(item => item === 'dvm' ? 'DVM': upperFirst(item)).join('');
            // }
            // const nameItems = role === 'backing' ? [name, fromToken.host]: [fromToken.host, name];
            // const bridgeName = nameItems.map(toCamelCase).join('-')

            // expect(target.name).toEqual(bridgeName);
          }
        );
      }
    );
  }
);

/**
 * Test whether the token transfer configuration of the bridge is correct;
 */
describe.skip.each(configs)("$name network's ", ({ name, tokens, ...other }) => {
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

    it.each(cross)('role should be set consistent with the bridge naming - $bridge', ({ bridge, partner }) => {
      const [backing, issuing] = bridge.split('-').map((chain) => toMiddleSplitNaming(chain));

      if (bridge === 'ethereum-darwinia') {
        if (other.isTest) {
          expect(from.host).toEqual(partner.role === 'backing' ? 'pangolin-dvm' : 'ropsten');
        } else {
          expect(from.host).toEqual(partner.role === 'backing' ? issuing : backing);
        }
      } else if (bridge === 'substrateDVM-ethereum') {
        if (other.isTest) {
          expect(from.host).toEqual(partner.role === 'backing' ? 'goerli' : 'pangolin-dvm');
        } else {
          expect(from.host).toEqual(partner.role === 'backing' ? 'ethereum' : 'darwinia-dvm');
        }
      } else if (bridge === 'arbitrum-ethereum') {
        if (other.isTest) {
          expect(from.host).toEqual(partner.role === 'backing' ? 'goerli' : 'arbitrum-goerli');
        } else {
          expect(from.host).toEqual(partner.role === 'backing' ? 'ethereum' : 'arbitrum');
        }
      } else if (partner.role === 'backing') {
        if (issuing === 'substrate') {
          expect(isPolkadotNetwork(from.host)).toBe(true);
        } else if (issuing === 'dvm' || issuing === 'substrate-dvm') {
          expect(isDVMNetwork(from.host)).toBe(true);
        } else if (issuing === 'substrate-parachain') {
          expect(isParachainNetwork(from.host)).toBe(true);
          // bridge inner: crabDVM<>darwiniaDVM darwiniaDVM<>crabDVM
        } else if (from.host === partner.name) {
          const backingChain = other.isTest ? mapToTestChain[backing] : backing;

          expect(from.host).toEqual(backingChain);
        } else if (bridge === 'darwiniaDVM-crabDVM' && other.isTest) {
          expect(from.host).toEqual(mapToTestChain[issuing]);
        } else if (other.isTest) {
          expect(from.host).toEqual(mapToTestChain[backing]);
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
        } else if (bridge === 'darwiniaDVM-crabDVM' && other.isTest) {
          expect(from.host).toEqual(mapToTestChain[backing]);
        } else if (bridge === 'darwinia-ethereum') {
          expect(isDVMNetwork(from.host)).toBe(true);
        } else if (other.isTest) {
          expect(from.host).toEqual(mapToTestChain[backing]);
        } else {
          expect(from.host).toEqual(backing);
        }
      }
    });
  });
});
