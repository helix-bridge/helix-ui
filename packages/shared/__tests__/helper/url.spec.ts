/// <reference types="jest" />

import { DEFAULT_DIRECTION } from '../../config/constant';
import { pangolinConfig, pangoroConfig, ropstenConfig } from '../../config/network';
import { validateDirection } from '../../utils/helper/url';

describe('url utils', () => {
  it('validate direction', () => {
    const ropstenRing = { ...ropstenConfig.tokens[0], amount: '', meta: ropstenConfig };
    const ropstenKton = { ...ropstenConfig.tokens[1], amount: '', meta: ropstenConfig };

    const res1 = validateDirection({ from: null, to: null });
    const res2 = validateDirection({ from: ropstenRing, to: null });
    const res3 = validateDirection({ from: ropstenRing, to: ropstenRing });
    const res4 = validateDirection({ from: ropstenKton, to: ropstenKton });

    expect(res1).toEqual(DEFAULT_DIRECTION);
    expect(res2).toEqual({ from: ropstenRing, to: DEFAULT_DIRECTION.to });
    expect(res3).toEqual(DEFAULT_DIRECTION);
    expect(res4).toEqual(DEFAULT_DIRECTION);
  });
});
