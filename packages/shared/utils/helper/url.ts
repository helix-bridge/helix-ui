import { mapKeys } from 'lodash';
import {
  CrossToken,
  HashInfo,
  HistoryRouteParam,
  NetworkMode,
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
  fm?: NetworkMode;
  tm?: NetworkMode;
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
  fMode: 'fm',
  tMode: 'tm',
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
    return { f: '', t: '', r: '', fm: '', tm: '' };
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

export const validateDirection: (dir: NullableCrossChainDirection) => NullableCrossChainDirection = (dir) => {
  const { from, to } = dir;

  if (from && to) {
    const reachable = from.bridges.find((item) => item.partner.symbol === to.symbol);

    return reachable ? dir : { from: null, to: null };
  }

  return dir;
};

// eslint-disable-next-line complexity
export const getDirectionFromSettings: () => NullableCrossChainDirection = () => {
  const fToken = getInitialSetting<string>('from', null);
  const tToken = getInitialSetting<string>('to', null);
  const fMode = getInitialSetting<NetworkMode>('fMode', 'native') as NetworkMode;
  const tMode = getInitialSetting<NetworkMode>('tMode', 'native') as NetworkMode;

  const from = fToken ? getChainConfig(fToken, fMode) : null;
  const to = tToken ? getChainConfig(tToken, tMode) : null;

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
    const config = getChainConfig(fromToken.bridges[0].partner);

    toToken = {
      ...config.tokens.find((item) => item.symbol === fromToken?.bridges[0].partner.symbol)!,
      amount: '',
      meta: config,
    };
  }

  if (!fromToken && toToken) {
    const config = getChainConfig(toToken.bridges[0].partner);

    fromToken = {
      ...config.tokens.find((item) => item.symbol === toToken?.bridges[0].partner.symbol)!,
      amount: '',
      meta: config,
    };
  }

  // if (!fromToken && !toToken) {
  //   fromToken = { ...darwiniaConfig.tokens[0], amount: '' };
  //   toToken = { ...ethereumConfig.tokens[1], amount: '' };
  // }

  return validateDirection({ from: fromToken, to: toToken });
};
