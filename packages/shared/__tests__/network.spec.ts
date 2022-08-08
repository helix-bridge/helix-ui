/// <reference types="jest" />

import { crabConfig, crabDVMConfig, darwiniaDVMConfig, pangolinDVMConfig, pangoroDVMConfig } from '../config/network';
import { crabParachainConfig } from '../config/network/crab-parachain';
import { pangolinParachainConfig } from '../config/network/pangolin-parachain';
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

  it('should contains chains count: ', () => {
    expect(chainConfigs).toHaveLength(14);
  });

  it('contains 2 bridges from crab', () => {
    const fromCrab = data.find((item) => item[0] === 'crab');

    expect(fromCrab).not.toEqual(undefined);
    expect(fromCrab![1]).toEqual(['crab-dvm', 'crab-parachain']);
  });

  it('contains 6 bridges from crab-dvm', () => {
    const fromCrabDVM = data.find((item) => item[0] === 'crab-dvm');

    expect(fromCrabDVM).not.toEqual(undefined);
    expect(fromCrabDVM![1]).toEqual(['crab', 'ethereum', 'heco', 'polygon', 'darwinia', 'darwinia-dvm']);
  });

  it('contains 3 bridges from darwinia', () => {
    const fromDarwinia = data.find((item) => item[0] === 'darwinia');

    expect(fromDarwinia).not.toEqual(undefined);
    expect(fromDarwinia![1]).toEqual(['crab-dvm', 'darwinia-dvm', 'ethereum']);
  });

  it('contains 2 bridges from darwinia-dvm', () => {
    const fromDarwinia = data.find((item) => item[0] === 'darwinia-dvm');

    expect(fromDarwinia).not.toEqual(undefined);
    expect(fromDarwinia![1]).toEqual(['darwinia', 'crab-dvm']);
  });

  it('contains 4 bridge from ethereum', () => {
    const fromEthereum = data.find((item) => item[0] === 'ethereum');

    expect(fromEthereum).not.toEqual(undefined);
    expect(fromEthereum![1]).toEqual(['crab-dvm', 'darwinia', 'heco', 'polygon']);
  });

  it('contains 3 bridges from pangolin', () => {
    const fromPangolin = data.find((item) => item[0] === 'pangolin');

    expect(fromPangolin).not.toEqual(undefined);
    expect(fromPangolin![1]).toEqual(['pangolin-dvm', 'pangolin-parachain', 'ropsten']);
  });

  it('contains 3 bridges from pangolin-dvm', () => {
    const fromPangolinDVM = data.find((item) => item[0] === 'pangolin-dvm');

    expect(fromPangolinDVM).not.toEqual(undefined);
    expect(fromPangolinDVM![1]).toEqual(['pangolin', 'pangoro-dvm', 'pangoro']);
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

  it('contains 3 bridge from heco', () => {
    const fromHeco = data.find((item) => item[0] === 'heco');

    expect(fromHeco).not.toEqual(undefined);
    expect(fromHeco![1]).toEqual(['crab-dvm', 'ethereum', 'polygon']);
  });

  it('contains 3 bridge from polygon', () => {
    const fromHeco = data.find((item) => item[0] === 'polygon');

    expect(fromHeco).not.toEqual(undefined);
    expect(fromHeco![1]).toEqual(['crab-dvm', 'ethereum', 'heco']);
  });

  it('contains 1 bridge from pangoro-dvm', () => {
    const fromPangoroDVM = data.find((item) => item[0] === 'pangoro-dvm');

    expect(fromPangoroDVM).not.toEqual(undefined);
    expect(fromPangoroDVM![1]).toEqual(['pangolin-dvm']);
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
  });

  it('can recognize ethereum network', () => {
    expect(isEthereumNetwork('ethereum')).toBe(true);
    expect(isEthereumNetwork('ropsten')).toBe(true);
    expect(isEthereumNetwork('crab-dvm')).toBe(true);
    expect(isEthereumNetwork('pangolin-dvm')).toBe(true);
    expect(isEthereumNetwork('heco')).toBe(true);
    expect(isEthereumNetwork('polygon')).toBe(true);
    expect(isEthereumNetwork('pangoro-dvm')).toBe(true);
  });

  it('can recognize dvm network', () => {
    expect(isDVMNetwork('crab-dvm')).toBe(true);
    expect(isDVMNetwork('pangolin-dvm')).toBe(true);
    expect(isDVMNetwork('pangoro-dvm')).toBe(true);
    expect(isDVMNetwork('darwinia-dvm')).toBe(true);
  });

  it('can convert display name', () => {
    expect(getDisplayName(crabConfig)).toEqual('Crab');
    expect(getDisplayName(crabDVMConfig)).toEqual('Crab Smart Chain');
    expect(getDisplayName(pangolinDVMConfig)).toEqual('Pangolin Smart Chain');
    expect(getDisplayName(pangoroDVMConfig)).toEqual('Pangoro Smart Chain');
    expect(getDisplayName(darwiniaDVMConfig)).toEqual('Darwinia Smart Chain');
    expect(getDisplayName(crabParachainConfig)).toEqual('Crab Parachain');
    expect(getDisplayName(pangolinParachainConfig)).toEqual('Pangolin Parachain');
  });
});
