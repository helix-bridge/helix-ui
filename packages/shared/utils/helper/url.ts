import { mapKeys } from 'lodash';
import { Network, HistoryRouteParam, StorageInfo, ValueOf, WithNull, NetworkMode, HashInfo } from '../../model';
import { readStorage } from './storage';

interface HashShort {
  f?: Network;
  t?: Network;
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
export const genHistoryRouteParams: (param: HistoryRouteParam) => string = ({ from, sender, to, fMode, tMode }) => {
  const params = new URLSearchParams();

  [
    { key: 'from', value: from || '' },
    { key: 'sender', value: sender || '' },
    { key: 'to', value: to || '' },
    { key: 'fMode', value: fMode || 'native' },
    { key: 'tMode', value: tMode || 'native' },
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
    fMode: params.get('fMode'),
    tMode: params.get('tMode'),
  } as HistoryRouteParam;
};
