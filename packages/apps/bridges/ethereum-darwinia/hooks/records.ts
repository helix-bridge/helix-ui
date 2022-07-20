import { decodeAddress } from '@polkadot/util-crypto';
import camelCaseKeys from 'camelcase-keys';
import { useCallback } from 'react';
import { catchError, filter, map, Observable, of } from 'rxjs';
import { isFormalChain } from 'shared/config/env';
import { ICamelCaseKeys } from 'shared/model';
import { apiUrl, rxGet } from 'shared/utils/helper';
import { buf2hex } from 'shared/utils/tx';
import { RecordList, RecordRequestParams, RecordsHooksResult } from '../../../model';
import {
  Darwinia2EthereumHistoryRes,
  Darwinia2EthereumRecord,
  Ethereum2DarwiniaRedeemHistoryRes,
  Ethereum2DarwiniaRedeemRecord,
} from '../model';

const E2D_ENDPOINT = isFormalChain ? 'https://helix-api.darwinia.network' : 'https://api.darwinia.network.l2me.com';

export function useRecords(): RecordsHooksResult<
  RecordList<ICamelCaseKeys<Darwinia2EthereumRecord> | ICamelCaseKeys<Ethereum2DarwiniaRedeemRecord>>
> {
  const fetchIssuingRecords = useCallback(({ address, confirmed, paginator }: RecordRequestParams) => {
    return rxGet<Darwinia2EthereumHistoryRes>({
      url: apiUrl(E2D_ENDPOINT, 'ethereumBacking/locks'),
      params: { address: buf2hex(decodeAddress(address).buffer), confirmed, ...paginator },
    }).pipe(
      map((res) => (res ? { ...res, list: res.list.map((item) => camelCaseKeys(item)) } : { count: 0, list: [] })),
      catchError((err) => {
        console.error('%c [ d2e records request error: ]', 'font-size:13px; background:pink; color:#bf2c9f;', err);
        return of(null);
      }),
      filter((res) => !!res)
    ) as NonNullable<Observable<Darwinia2EthereumHistoryRes<ICamelCaseKeys<Darwinia2EthereumRecord>>>>;
  }, []);

  const fetchRedeemRecords = useCallback(({ address, confirmed, paginator }: RecordRequestParams) => {
    return rxGet<Ethereum2DarwiniaRedeemHistoryRes>({
      url: apiUrl(E2D_ENDPOINT, 'redeem'),
      params: { address, confirmed, ...paginator },
    }).pipe(
      map((res) => (res ? { ...res, list: res.list.map((item) => camelCaseKeys(item)) } : { count: 0, list: [] })),
      catchError((err) => {
        console.error(
          '%c [ e2d cross chain api request error: ]',
          'font-size:13px; background:pink; color:#bf2c9f;',
          err
        );
        return of(null);
      }),
      filter((res) => !!res)
    ) as NonNullable<Observable<Ethereum2DarwiniaRedeemHistoryRes<ICamelCaseKeys<Ethereum2DarwiniaRedeemRecord>>>>;
  }, []);

  return {
    fetchRedeemRecords,
    fetchIssuingRecords,
  };
}
