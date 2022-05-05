/// <reference types="jest" />

import { crabConfig, crabDVMConfig, darwiniaConfig, pangolinConfig, pangoroConfig } from '../config/network';
import { pangolinDVMConfig } from '../config/network/pangolin-dvm';
import { ChainConfig } from '../model';
import { isTransferable } from '../utils/bridge';

describe('bridge utils', () => {
  it('should predicate transferable correctly', () => {
    const crabToCrab = {
      from: { ...crabConfig.tokens[0], meta: crabConfig, amount: '' },
      to: { ...crabDVMConfig.tokens[0], meta: crabDVMConfig, amount: '' },
    };

    const ktonToCkton = {
      from: { ...crabConfig.tokens[1], meta: crabConfig, amount: '' },
      to: { ...crabDVMConfig.tokens[1], meta: crabDVMConfig, amount: '' },
    };

    const ktonToCrab = {
      from: { ...crabConfig.tokens[1], meta: crabConfig, amount: '' },
      to: { ...crabDVMConfig.tokens[0], meta: crabDVMConfig, amount: '' },
    };

    const genTransfers = (from: ChainConfig, to: ChainConfig) =>
      from.tokens.map((token, index) => {
        return {
          from: { ...token, amount: '', meta: from },
          to: { ...to.tokens[index], amount: '', meta: to },
        };
      });

    const crabCrabDVMTransfers = genTransfers(crabConfig, crabDVMConfig);
    const pangoroDarwiniaTransfers = genTransfers(pangolinConfig, darwiniaConfig);
    const pangolinPangolinDVMTransfers = genTransfers(pangolinConfig, pangolinDVMConfig);

    expect(isTransferable(crabToCrab)).toEqual(true);
    expect(isTransferable(ktonToCkton)).toEqual(true);
    expect(isTransferable(ktonToCrab)).toEqual(false);

    crabCrabDVMTransfers.forEach((item) => {
      expect(isTransferable(item)).toEqual(true);
    });
    pangoroDarwiniaTransfers.forEach((item) => {
      expect(isTransferable(item)).toEqual(false);
    });
    pangolinPangolinDVMTransfers.forEach((item) => {
      expect(isTransferable(item)).toEqual(true);
    });
  });
});
