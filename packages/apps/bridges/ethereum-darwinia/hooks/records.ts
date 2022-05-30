import { decodeAddress } from '@polkadot/util-crypto';
import camelCaseKeys from 'camelcase-keys';
import { useCallback } from 'react';
import { catchError, filter, map, Observable, of } from 'rxjs';
import { DarwiniaApiPath } from 'shared/config/api';
import { ICamelCaseKeys } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { apiUrl, rxGet } from 'shared/utils/helper';
import { buf2hex } from 'shared/utils/tx';
import { RecordList, RecordRequestParams, RecordsHooksResult } from '../../../model';
import {
  Darwinia2EthereumHistoryRes,
  Darwinia2EthereumRecord,
  Ethereum2DarwiniaRedeemHistoryRes,
  Ethereum2DarwiniaRedeemRecord,
  EthereumDarwiniaBridgeConfig,
} from '../model';

export function useRecords(): RecordsHooksResult<
  RecordList<ICamelCaseKeys<Darwinia2EthereumRecord> | ICamelCaseKeys<Ethereum2DarwiniaRedeemRecord>>
> {
  const fetchIssuingRecords = useCallback(({ address, confirmed, direction, paginator }: RecordRequestParams) => {
    const bridge = getBridge<EthereumDarwiniaBridgeConfig>(direction);
    const api = bridge.config.api.dapp;

    return rxGet<Darwinia2EthereumHistoryRes>({
      url: apiUrl(api, DarwiniaApiPath.locks),
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

  const fetchRedeemRecords = useCallback(({ address, confirmed, direction, paginator }: RecordRequestParams) => {
    const bridge = getBridge<EthereumDarwiniaBridgeConfig>(direction);
    const api = bridge.config.api.dapp;

    return rxGet<Ethereum2DarwiniaRedeemHistoryRes>({
      url: apiUrl(api, DarwiniaApiPath.redeem),
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
