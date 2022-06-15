/// <reference types="jest" />

import { crabConfig, crabDVMConfig, darwiniaConfig, ethereumConfig } from '../config/network';
import { ChainConfig, Network, TokenWithBridgesInfo } from '../model';
import {
  getBridges,
  isDarwinia2Ethereum,
  isDVM2Substrate,
  isEthereum2Darwinia,
  isEthereumDarwinia,
  isSubstrate2DVM,
  isSubstrate2SubstrateDVM,
  isSubstrateDVM,
  isSubstrateDVM2Substrate,
  isSubstrateSubstrate,
} from '../utils/bridge';
import { crossChainGraph } from '../utils/network';

describe('bridge utils', () => {
  function findBySymbol(config: ChainConfig, symbol: string): TokenWithBridgesInfo {
    return config.tokens.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase())!;
  }

  const allDirections = crossChainGraph
    .map(([departure, arrivals]) => arrivals.map((arrival) => [departure, arrival]))
    .flat();

  console.log('🌉 All cross-chain directions to be tested', allDirections);

  it('should get bridges correctly', () => {
    const s2DVM = {
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

    const substrate2DVM = getBridges(s2DVM);
    const substrate2Substrate = getBridges(s2s);
    const ethereum2Darwinia = getBridges(e2d);

    expect(substrate2DVM).toHaveLength(1);
    expect(substrate2Substrate).toHaveLength(1);
    expect(ethereum2Darwinia).toHaveLength(1);
  });

  it('should recognize substrate <-> dvm (Smart app transfers)', () => {
    const directions: Network[][] = [
      ['crab', 'crab-dvm'],
      ['pangolin', 'pangolin-dvm'],
    ];
    const revertDirs = directions.map((item) => [...item].reverse());

    allDirections.forEach((direction) => {
      const [from, to] = direction;
      const is = !!directions.find((item) => item.join('->') === direction.join('->'));

      expect(isSubstrate2DVM(from, to)).toBe(is);
    });

    allDirections.forEach((direction) => {
      const [from, to] = direction;
      const is = !!revertDirs.find((item) => item.join('->') === direction.join('->'));

      expect(isDVM2Substrate(from, to)).toBe(is);
    });

    allDirections.forEach((direction) => {
      const [from, to] = direction;
      const is = !![...directions, ...revertDirs].find((item) => item.join('->') === direction.join('->'));

      expect(isSubstrateDVM(from, to)).toBe(is);
    });
  });

  it('should recognize substrate <-> substrate dvm', () => {
    const directions: Network[][] = [
      ['pangoro', 'pangolin-dvm'],
      ['darwinia', 'crab-dvm'],
    ];
    const revertDirs = directions.map((item) => [...item].reverse());

    allDirections.forEach((direction) => {
      const [from, to] = direction;
      const is = !!directions.find((item) => item.join('->') === direction.join('->'));

      expect(isSubstrate2SubstrateDVM(from, to)).toBe(is);
    });

    allDirections.forEach((direction) => {
      const [from, to] = direction;
      const is = !!revertDirs.find((item) => item.join('->') === direction.join('->'));

      expect(isSubstrateDVM2Substrate(from, to)).toBe(is);
    });

    allDirections.forEach((direction) => {
      const [from, to] = direction;
      const is = !![...directions, ...revertDirs].find((item) => item.join('->') === direction.join('->'));

      expect(isSubstrateSubstrate(from, to)).toBe(is);
    });
  });

  it('should recognize ethereum <-> darwinia', () => {
    const directions: Network[][] = [
      ['ethereum', 'darwinia'],
      ['ropsten', 'pangolin'],
    ];
    const revertDirs = directions.map((item) => [...item].reverse());

    allDirections.forEach((direction) => {
      const [from, to] = direction;
      const is = !!directions.find((item) => item.join('->') === direction.join('->'));

      expect(isEthereum2Darwinia(from, to)).toBe(is);
    });

    allDirections.forEach((direction) => {
      const [from, to] = direction;
      const is = !!revertDirs.find((item) => item.join('->') === direction.join('->'));

      expect(isDarwinia2Ethereum(from, to)).toBe(is);
    });

    allDirections.forEach((direction) => {
      const [from, to] = direction;
      const is = !![...directions, ...revertDirs].find((item) => item.join('->') === direction.join('->'));

      expect(isEthereumDarwinia(from, to)).toBe(is);
    });
  });
});
