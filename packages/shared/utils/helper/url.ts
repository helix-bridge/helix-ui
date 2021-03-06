import { isEqual, mapKeys } from 'lodash';
import { DEFAULT_DIRECTION } from '../../config/constant';
import {
  CrossChainDirection,
  CrossToken,
  HashInfo,
  HistoryRouteParam,
  Network,
  NullableCrossChainDirection,
  StorageInfo,
  ValueOf,
  WithNull,
} from '../../model';
import { getChainConfig } from '../network';
import { readStorage } from './storage';

interface HashShort {
  f?: string;
  t?: string;
  r?: string;
}

type SettingKey = keyof StorageInfo | keyof HashInfo;

type SettingValue = ValueOf<HashInfo> & ValueOf<StorageInfo>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type AdapterMap<T extends object, D extends object> = {
  [key in keyof T]?: keyof D;
};

const toShort: AdapterMap<HashInfo, HashShort> = {
  from: 'f',
  to: 't',
  recipient: 'r',
};

const toLong: AdapterMap<HashShort, HashInfo> = Object.entries(toShort).reduce(
  (acc, cur) => ({ ...acc, [cur[1]]: cur[0] }),
  {}
);

function hashToObj(): { [key in keyof HashShort]: string } {
  try {
    const str = decodeURIComponent(location.hash);

    return str
      .replace('#', '')
      .split('&')
      .filter((item) => !!item)
      .reduce((acc, cur) => {
        const [key, value] = cur.split('=');

        return { ...acc, [key]: value };
      }, {}) as { [key in keyof HashShort]: string };
  } catch (err) {
    return { f: '', t: '', r: '' };
  }
}

export function patchUrl(info: HashInfo): void {
  const data = mapKeys(info, (_, key) => toShort[key as keyof HashInfo]);
  const oData = hashToObj();
  const hash = Object.entries({ ...oData, ...data })
    .filter(([_, value]) => !!value)
    .reduce((acc, cur) => {
      const pair = `${cur[0]}=${cur[1]}`;

      return acc !== '' ? `${acc}&${pair}` : pair;
    }, '');

  location.hash = hash !== '' ? encodeURIComponent(hash) : '';
}

export function getInfoFromHash(): HashInfo {
  const info = hashToObj();

  return mapKeys(info, (_, key) => toLong[key as keyof HashShort]);
}

export function getInitialSetting<T = SettingValue | string>(key: SettingKey, defaultValue: T | null): T | null {
  const fromHash = getInfoFromHash();
  const fromStorage = readStorage();

  return (
    ((fromHash[key as keyof HashInfo] ?? fromStorage[key as keyof StorageInfo] ?? defaultValue) as unknown as T) || null
  );
}

export function apiUrl(domain: string, path: string): string {
  return domain + '/api/' + path;
}

// eslint-disable-next-line complexity
export const genHistoryRouteParams: (param: HistoryRouteParam) => string = ({ from, sender, to }) => {
  const params = new URLSearchParams();

  [
    { key: 'from', value: from || '' },
    { key: 'sender', value: sender || '' },
    { key: 'to', value: to || '' },
  ].forEach(({ key, value }) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params.toString();
};

export const getHistoryRouteParams: (search: string) => WithNull<HistoryRouteParam> = (search) => {
  const params = new URLSearchParams(search);

  return {
    from: params.get('from'),
    sender: params.get('sender'),
    to: params.get('to'),
  } as HistoryRouteParam;
};

// eslint-disable-next-line complexity
export const validateDirection: (dir: NullableCrossChainDirection) => CrossChainDirection = (dir) => {
  const { from, to } = dir;

  if (isEqual(from, to)) {
    return DEFAULT_DIRECTION;
  }

  if (from && to) {
    const reachable = from.cross.find((item) => item.partner.symbol === to.symbol);

    return reachable ? (dir as CrossChainDirection) : DEFAULT_DIRECTION;
  }

  return { from: from ?? DEFAULT_DIRECTION.from, to: to ?? DEFAULT_DIRECTION.to };
};

/**
 * TODO: Find the correct CrossChainDirection by the information from the hash or localStorage settings
 */
// eslint-disable-next-line complexity
export const getDirectionFromSettingsWeak: () => CrossChainDirection = () => {
  const fToken = getInitialSetting<Network>('from', null);
  const tToken = getInitialSetting<Network>('to', null);

  const from = fToken && getChainConfig(fToken);
  const to = tToken && getChainConfig(tToken);

  let fromToken: CrossToken | null = null;
  let toToken: CrossToken | null = null;

  if (from) {
    const token = from.tokens.find((item) => item.symbol === fToken)!;

    fromToken = { ...token, amount: '', meta: from };
  }

  if (to) {
    const token = to.tokens.find((item) => item.symbol === tToken)!;

    toToken = { ...token, amount: '', meta: to };
  }

  if (fromToken && !toToken) {
    const config = getChainConfig(fromToken.cross[0].partner.name);

    toToken = {
      ...config.tokens.find((item) => item.symbol === fromToken?.cross[0].partner.symbol)!,
      amount: '',
      meta: config,
    };
  }

  if (!fromToken && toToken) {
    const config = getChainConfig(toToken.cross[0].partner.name);

    fromToken = {
      ...config.tokens.find((item) => item.symbol === toToken?.cross[0].partner.symbol)!,
      amount: '',
      meta: config,
    };
  }

  return validateDirection({ from: fromToken, to: toToken });
};

export const getDirectionFromSettings: () => CrossChainDirection = () => {
  return DEFAULT_DIRECTION;
};
