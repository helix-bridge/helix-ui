import { formatFixed as fw, parseFixed as tw } from '@ethersproject/bignumber';
import { BN, BN_ONE } from '@polkadot/util';
import Bignumber from 'bignumber.js';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import { HELIX_XCM_FLAG } from '../../config/constant';

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

export function truncate(amount: string, decimals: number): string;
export function truncate(amount: number, decimals: number): number;
export function truncate(amount: number | string, decimals: number): number | string {
  const [integer, decimal] = amount.toString().split('.');

  if (decimal && decimal.length > decimals) {
    const result = integer + '.' + decimal.slice(0, decimals);

    if (typeof amount === 'number') {
      return Number(result);
    }

    return result;
  }

  return amount;
}

export function fromWei(
  { value, amount, balance, decimals = DEFAULT_DECIMALS }: WeiArgs,
  ...fns: ((value: string) => string)[]
): string {
  const data = value || amount || balance;

  return [
    toStr,
    (val: string) => fw(val || '0', decimals).toString(),
    ...fns,
    (v: string) => (v.endsWith('.0') ? v.split('.')[0] : v),
  ].reduce((acc, fn) => fn(acc as string), data) as string;
}

export function toWei(
  { value, amount, balance, decimals = DEFAULT_DECIMALS }: WeiArgs,
  ...fns: ((value: string) => string)[]
): string {
  const data = value || amount || balance;

  return [
    toStr,
    (val: string) => truncate(val, decimals),
    (val: string) => tw(val || '0', decimals).toString(),
    ...fns,
  ].reduce((acc, fn) => fn(acc as string), data) as string;
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

export function addHelixFlag(amount: string | number | BN, decimals = 18): string {
  const len = String(HELIX_XCM_FLAG).length;
  const num = toWei({ value: amount, decimals });
  const tail = Number(num.slice(-len));
  const flag = new BN(num.slice(0, -len) + String(HELIX_XCM_FLAG));

  if (tail === HELIX_XCM_FLAG) {
    return amount.toString();
  } else if (new BN(num).gte(flag)) {
    return fromWei({ value: flag, decimals });
  } else {
    const result = new BN(num.slice(0, -len)).sub(new BN(1)).toString();

    return fromWei({ value: result + HELIX_XCM_FLAG, decimals });
  }
}

export function removeHelixFlag(amount: string | number | BN, decimals = 18): string {
  const len = String(HELIX_XCM_FLAG).length;
  const num = toWei({ value: amount, decimals }).slice(0, -len);
  const tail = num[num.length - 1];
  const flag = 4;
  const rounded = Number(tail) > flag ? new BN(num).add(BN_ONE) : new BN(num.slice(0, -1) + '0');

  return fromWei({ value: rounded.toString() + new Array(len).fill('0').join(''), decimals });
}
