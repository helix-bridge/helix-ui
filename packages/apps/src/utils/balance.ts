import { formatUnits } from "viem";

interface Options {
  precision?: number;
  keepZero?: boolean;
}

export function formatBalance(value: bigint, decimals = 18, options: Options = { precision: 3, keepZero: false }) {
  const precision = options.precision === undefined ? 3 : options.precision;
  const keepZero = options.keepZero === undefined ? false : options.keepZero;

  const [i, d] = formatUnits(value, decimals).split(".");

  const _integers = i.replace(/(?=(?!^)(\d{3})+$)/g, ",");
  let _decimals = Number(`0.${d || 0}`).toFixed(precision);

  if (!keepZero) {
    _decimals = Number(_decimals).toString();
  }

  return `${_integers}${_decimals.slice(1)}`;
}
