import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import { map, Observable } from 'rxjs';
import { ajax } from 'rxjs/ajax';

export interface RecordsQueryRequest {
  url: string;
  params: Record<string, string | number | boolean | undefined | null>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RecordsQueryResponse<T = any> {
  code: number;
  detail: string;
  data?: T;
}

export function rxGet<T>({ url, params }: RecordsQueryRequest): Observable<T | null> {
  const queryStr = Object.entries(params || {})
    .filter(([_, value]) => !isNull(value) && !isUndefined(value))
    .reduce((acc, cur) => {
      const pair = `${cur[0]}=${cur[1]}`;

      return acc !== '' ? `${acc}&${pair}` : pair;
    }, '');

  return ajax<T>({
    url: url + (queryStr ? `?${queryStr}` : ''),
    method: 'GET',
  }).pipe(
    map(
      (res) =>
        (/coingecko/.test(url) ? res.response : (res.response as unknown as RecordsQueryResponse<T>).data) || null
    )
  );
}
