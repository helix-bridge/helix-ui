/// <reference types="jest" />

import { addHelixFlag, largeNumber, prettyNumber, removeHelixFlag, toWei } from '../../utils/helper/balance';

describe('balance utils', () => {
  it('pretty number', () => {
    const tests = [
      { num: 1234, options: undefined, res: '1,234.000' },
      { num: 100000000, options: undefined, res: '100,000,000.000' },
      { num: 100000000, options: { ignoreZeroDecimal: true, decimal: 2 }, res: '100,000,000' },
      { num: 100000000.2, options: undefined, res: '100,000,000.2' },
      { num: 100000000.234, options: { ignoreZeroDecimal: true, decimal: 2 }, res: '100,000,000.23' },
      { num: 100000000.235, options: { ignoreZeroDecimal: true, decimal: 2 }, res: '100,000,000.23' },
      { num: '1K', options: { ignoreZeroDecimal: true }, res: '1K' },
      { num: '1K', options: { decimal: 1 }, res: '1.0K' },
      { num: '2983M', options: undefined, res: '2,983.000M' },
      { num: '2983M', options: { decimal: 0 }, res: '2,983M' },
      { num: '2983.000M', options: { ignoreZeroDecimal: true }, res: '2,983M' },
      { num: '2983.303M', options: { ignoreZeroDecimal: true }, res: '2,983.303M' },
    ];

    tests.forEach((item) => {
      expect(prettyNumber(item.num, item.options as any)).toEqual(item.res);
    });
  });

  it('large number', () => {
    const tests = [
      { num: 0, decimals: 1, res: '0' },
      { num: 12, decimals: 1, res: '12' },
      { num: 1234, decimals: 1, res: '1.2K' },
      { num: 100000000, decimals: 1, res: '100M' },
      { num: 299792458, decimals: 1, res: '299.8M' },
      { num: 759878, decimals: 1, res: '759.9K' },
      { num: 759878, decimals: 0, res: '760K' },
      { num: 123, decimals: 1, res: '123' },
      { num: 123.456, decimals: 1, res: '123.5' },
      { num: 123.456, decimals: 2, res: '123.46' },
      { num: 123.456, decimals: 4, res: '123.456' },
    ];

    tests.forEach((item) => {
      expect(largeNumber(item.num, item.decimals)).toEqual(item.res);
    });
  });

  it('can to wei', () => {
    expect(toWei({ value: 1 })).toEqual('1000000000000000000');
    expect(toWei({ value: 1.23456789 })).toEqual('1234567890000000000');
    expect(toWei({ value: 1.23456789, decimals: 6 })).toEqual('1234567');
  });

  it('can add helix flag safely', () => {
    expect(addHelixFlag('1')).toEqual('0.999999999999999204');
    expect(addHelixFlag('0.999999999999999203', 18)).toEqual('0.999999999999998204');
    expect(addHelixFlag('0.999999999999999204', 18)).toEqual('0.999999999999999204');
    expect(addHelixFlag('0.98')).toEqual('0.979999999999999204');

    expect(addHelixFlag('1', 12)).toEqual('0.999999999204');
    expect(addHelixFlag('0.999999999203', 12)).toEqual('0.999999998204');
    expect(addHelixFlag('0.999999999204', 12)).toEqual('0.999999999204');
    expect(addHelixFlag('0.98', 12)).toEqual('0.979999999204');

    expect(addHelixFlag('1', 6)).toEqual('0.999204');
    expect(addHelixFlag('0.999203', 6)).toEqual('0.998204');
    expect(addHelixFlag('0.999204', 6)).toEqual('0.999204');
    expect(addHelixFlag('0.98', 6)).toEqual('0.979204');
  });

  it('use rounding to remove marker bits', () => {
    expect(removeHelixFlag('0.999999999999994204')).toEqual('0.99999999999999');
    expect(removeHelixFlag('0.999999999999995204')).toEqual('0.999999999999996');
    expect(removeHelixFlag('0.999999999999998204')).toEqual('0.999999999999999');
    expect(removeHelixFlag('0.999999999999999204')).toEqual('1');

    expect(removeHelixFlag('0.999999994204', 12)).toEqual('0.99999999');
    expect(removeHelixFlag('0.999999995204', 12)).toEqual('0.999999996');
    expect(removeHelixFlag('0.999999998204', 12)).toEqual('0.999999999');
    expect(removeHelixFlag('0.999999999204', 12)).toEqual('1');
  });
});
