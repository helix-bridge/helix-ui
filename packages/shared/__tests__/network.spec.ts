/// <reference types="jest" />

import { crabConfig, crabDVMConfig, darwiniaConfig, ethereumConfig, pangolinConfig } from '../config/network';
import { crabParachainConfig } from '../config/network/crab-parachain';
import { crossChainGraph } from '../utils/network/graph';
import {
  chainConfigs,
  getChainConfig,
  getDisplayName,
  isDVMNetwork,
  isEthereumNetwork,
  isPolkadotNetwork,
} from '../utils/network/network';

describe('network utils', () => {
  const data = [...crossChainGraph];

  it('contains 2 bridges from crab', () => {
    const fromCrab = data.find((item) => item[0] === 'crab');

    expect(fromCrab).not.toEqual(undefined);
    expect(fromCrab![1]).toEqual(['crab-dvm', 'crab-parachain']);
  });

  it('contains 3 bridges from crab-dvm', () => {
    const fromCrabDVM = data.find((item) => item[0] === 'crab-dvm');

    expect(fromCrabDVM).not.toEqual(undefined);
    expect(fromCrabDVM![1]).toEqual(['crab', 'darwinia', 'heco']);
  });

  it('contains 2 bridges from darwinia', () => {
    const fromDarwinia = data.find((item) => item[0] === 'darwinia');

    expect(fromDarwinia).not.toEqual(undefined);
    expect(fromDarwinia![1]).toEqual(['crab-dvm', 'ethereum']);
  });

  it('contains 1 bridge from ethereum', () => {
    const fromEthereum = data.find((item) => item[0] === 'ethereum');

    expect(fromEthereum).not.toEqual(undefined);
    expect(fromEthereum![1]).toEqual(['darwinia']);
  });

  it('contains 3 bridges from pangolin', () => {
    const fromPangolin = data.find((item) => item[0] === 'pangolin');

    expect(fromPangolin).not.toEqual(undefined);
    expect(fromPangolin![1]).toEqual(['pangolin-dvm', 'ropsten', 'pangolin-parachain']);
  });

  it('contains 2 bridges from pangolin-dvm', () => {
    const fromPangolinDVM = data.find((item) => item[0] === 'pangolin-dvm');

    expect(fromPangolinDVM).not.toEqual(undefined);
    expect(fromPangolinDVM![1]).toEqual(['pangolin', 'pangoro']);
  });

  it('contains 1 bridge from pangoro', () => {
    const fromPangoro = data.find((item) => item[0] === 'pangoro');

    expect(fromPangoro).not.toEqual(undefined);
    expect(fromPangoro![1]).toEqual(['pangolin-dvm']);
  });

  it('contains 1 bridge from ropsten', () => {
    const fromRopsten = data.find((item) => item[0] === 'ropsten');

    expect(fromRopsten).not.toEqual(undefined);
    expect(fromRopsten![1]).toEqual(['pangolin']);
  });

  it('contains 1 bridge from heco', () => {
    const fromHeco = data.find((item) => item[0] === 'heco');

    expect(fromHeco).not.toEqual(undefined);
    expect(fromHeco![1]).toEqual(['crab-dvm']);
  });

  it('should have desired number of cross-chains', () => {
    expect(chainConfigs).toHaveLength(11);
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
  });

  it('can recognize ethereum network', () => {
    expect(isEthereumNetwork('ethereum')).toBe(true);
    expect(isEthereumNetwork('ropsten')).toBe(true);
    expect(isEthereumNetwork('crab-dvm')).toBe(true);
    expect(isEthereumNetwork('pangolin-dvm')).toBe(true);
  });

  it('can recognize dvm network', () => {
    expect(isDVMNetwork('crab-dvm')).toBe(true);
    expect(isDVMNetwork('pangolin-dvm')).toBe(true);
  });

  it('can get network config by chain name', () => {
    expect(getChainConfig('crab')).toEqual(crabConfig);
    expect(getChainConfig('crab-dvm')).toEqual(crabDVMConfig);
    // expect(getChainConfig('crab-parachain')).toEqual(crabParachainConfig);
    expect(getChainConfig('ethereum')).toEqual(ethereumConfig);
    expect(getChainConfig('darwinia')).toEqual(darwiniaConfig);
  });

  it('can convert display name', () => {
    expect(getDisplayName(crabConfig)).toEqual('Crab');
    expect(getDisplayName(crabDVMConfig)).toEqual('Crab Smart Chain');
    expect(getDisplayName(crabParachainConfig)).toEqual('Crab Parachain');
  });
});
