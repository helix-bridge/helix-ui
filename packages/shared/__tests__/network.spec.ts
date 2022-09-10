/// <reference types="jest" />

import { isDVMNetwork, isEthereumNetwork, isParachainNetwork, isPolkadotNetwork } from '../utils/network/network';

describe('network utils', () => {
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
});
