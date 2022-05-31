/// <reference types="jest" />

import { crabConfig, crabDVMConfig, darwiniaConfig, ethereumConfig } from '../config/network';
import { ChainConfig, TokenWithBridgesInfo } from '../model';
import { getBridges } from '../utils/bridge';

describe('bridge utils', () => {
  function findBySymbol(config: ChainConfig, symbol: string): TokenWithBridgesInfo {
    return config.tokens.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase())!;
  }

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
});
