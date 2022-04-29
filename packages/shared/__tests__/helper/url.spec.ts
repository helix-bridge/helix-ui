/// <reference types="jest" />

import { pangolinConfig, ropstenConfig } from '../../config/network';
import { validateDirection } from '../../utils/helper/url';

describe('url utils', () => {
  it('validate direction', () => {
    const ropsten = { ...ropstenConfig.tokens[0], amount: '' };
    const ropstenRing = { ...ropstenConfig.tokens[1], amount: ''  }
    const ropstenKton = { ...ropstenConfig.tokens[2], amount: ''  }
    const pangolin = { ...pangolinConfig.tokens[0], amount: '' };
    const pangolinKton = { ...pangolinConfig.tokens[1], amount: '' };

    const res1 = validateDirection({ from: null, to: null });
    const res2 = validateDirection({ from: ropsten, to: null });
    const res3 = validateDirection({ from: ropsten, to: ropsten });
    const res4 = validateDirection({ from: ropsten, to: pangolin })
    const res5 = validateDirection({ from: ropstenRing, to: pangolin });
    const res6 = validateDirection({ from: ropstenKton, to: pangolin });
    const res7 = validateDirection({ from: ropstenKton, to: pangolinKton });

    expect(res1).toEqual({ from: null, to: null });
    expect(res2).toEqual({ from: ropsten, to: null });
    expect(res3).toEqual({ from: null, to: null });
    expect(res4).toEqual({ from: null, to: null });
    expect(res5).toEqual({ from: ropstenRing, to: pangolin });
    expect(res6).toEqual({ from: null, to: null });
    expect(res7).toEqual({ from: ropstenKton, to: pangolinKton });
  });
});
