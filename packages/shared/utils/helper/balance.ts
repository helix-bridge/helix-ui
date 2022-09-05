import { formatFixed as fw, parseFixed as tw } from '@ethersproject/bignumber';
import Bignumber from 'bignumber.js';
import BN from 'bn.js';
import { isEmpty, isNull, isNumber, isString, isUndefined } from 'lodash';

export type WeiValue = string | BN | number | null | undefined | Bignumber;
export interface PrettyNumberOptions {
  decimal?: number;
  ignoreZeroDecimal?: boolean;
}

// eslint-disable-next-line complexity
const toStr = (value: WeiValue): string => {
  if (BN.isBN(value) || Bignumber.isBigNumber(value)) {
    return value.toString();
  } else if (isString(value)) {
    return value.replace(/,/g, '');
  } else if (isNumber(value)) {
    return String(value);
  } else if (isUndefined(value) || isNull(value) || isNaN(value)) {
    return '0';
  } else {
    throw new TypeError(`Can not convert the value ${value} to String type. Value type is ${typeof value}`);
  }
};

const isDecimal = (value: number | string) => {
  return /\d+\.\d+/.test(String(value));
};

// eslint-disable-next-line complexity
export function prettyNumber(value: WeiValue, options?: PrettyNumberOptions): string {
  const { decimal, ignoreZeroDecimal } =
    !options || isEmpty(options) ? { decimal: 3, ignoreZeroDecimal: false } : options;

  if (value === null || typeof value === 'undefined') {
    return '-';
  }

  if (typeof value === 'number' || BN.isBN(value) || Bignumber.isBigNumber(value)) {
    value = value.toString();
  }

  let unit = '';

  if (/[A-Z]/i.test(value)) {
    unit = value.slice(-1);
    value = value.slice(0, -1);
  }

  const isDecimalNumber = isDecimal(value);
  let prefix = isDecimalNumber ? value.split('.')[0] : value;
  const suffix = isDecimalNumber
    ? completeDecimal(value.split('.')[1], decimal as number)
    : new Array(decimal).fill(0).join('');

  prefix = prefix.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');

  const result =
    +suffix !== 0
      ? `${prefix}.${suffix}`
      : ignoreZeroDecimal || !decimal
      ? prefix
      : `${prefix}.${'0'.padEnd(decimal!, '0')}`;

  return (+result === 0 ? '0' : result) + unit;
}

const DEFAULT_DECIMALS = 18;

interface WeiArgs {
  value?: WeiValue;
  decimals?: number;
  amount?: WeiValue;
  balance?: WeiValue;
}

export function fromWei(
  { value, amount, balance, decimals = DEFAULT_DECIMALS }: WeiArgs,
  ...fns: ((value: string) => string)[]
): string {
  const data = value || amount || balance;

  return [toStr, (val: string) => fw(val || '0', decimals).toString(), ...fns].reduce(
    (acc, fn) => fn(acc as string),
    data
  ) as string;
}

export function toWei(
  { value, amount, balance, decimals = DEFAULT_DECIMALS }: WeiArgs,
  ...fns: ((value: string) => string)[]
): string {
  const data = value || amount || balance;

  return [toStr, (val: string) => tw(val || '0', decimals).toString(), ...fns].reduce(
    (acc, fn) => fn(acc as string),
    data
  ) as string;
}

const completeDecimal = (value: string, bits: number): string => {
  const length = value.length;

  return length > bits ? value.slice(0, bits) : value;
};

export function largeNumber(num: string | number, decimals = 0) {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const result = lookup
    .slice()
    .reverse()
    .find((item) => +num >= item.value);

  return result ? (+num / result.value).toFixed(decimals).replace(rx, '$1') + result.symbol : '0';
}
