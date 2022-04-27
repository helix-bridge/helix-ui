import { DarwiniaApiPath } from 'shared/config/api';
import { ICamelCaseKeys, ChainConfig } from 'shared/model';
import { getBridge, rxGet, apiUrl } from 'shared/utils';
import camelCaseKeys from 'camelcase-keys';
import { useCallback } from 'react';
import { catchError, filter, map, Observable, of } from 'rxjs';
import { RecordsHooksResult, RecordList, RecordRequestParams } from '../../../model';
import {
  Darwinia2EthereumHistoryRes,
  Darwinia2EthereumRecord,
  Ethereum2DarwiniaRedeemHistoryRes,
  Ethereum2DarwiniaRedeemRecord,
} from '../../ethereum-darwinia/model';
import { EthereumDVMBridgeConfig } from '../model';

type D2EOriginRes = Darwinia2EthereumHistoryRes<Darwinia2EthereumRecord>;
type D2EMappingRes = Darwinia2EthereumHistoryRes<ICamelCaseKeys<Darwinia2EthereumRecord>>;
type E2DOriginRes = Ethereum2DarwiniaRedeemHistoryRes<Ethereum2DarwiniaRedeemRecord>;
type E2DMappingRes = Ethereum2DarwiniaRedeemHistoryRes<ICamelCaseKeys<Ethereum2DarwiniaRedeemRecord>>;

export function useRecords(
  _: ChainConfig,
  _2: ChainConfig
): RecordsHooksResult<
  RecordList<ICamelCaseKeys<Darwinia2EthereumRecord> | ICamelCaseKeys<Ethereum2DarwiniaRedeemRecord>>
> {
  const fetchIssuingRecords = useCallback(({ address, confirmed, direction, paginator }: RecordRequestParams) => {
    const bridge = getBridge<EthereumDVMBridgeConfig>(direction);
    const api = bridge.config.api.dapp;

    return rxGet<D2EOriginRes>({
      url: apiUrl(api, DarwiniaApiPath.issuingBurns),
      params: { sender: address, confirmed, ...paginator },
    }).pipe(
      map((res) => (res ? { ...res, list: res.list.map((item) => camelCaseKeys(item)) } : { count: 0, list: [] })),
      catchError((err) => {
        console.error('%c [ dvm2e records request error: ]', 'font-size:13px; background:pink; color:#bf2c9f;', err);
        return of(null);
      }),
      filter((res) => !!res)
    ) as NonNullable<Observable<D2EMappingRes>>;
  }, []);

  const fetchRedeemRecords = useCallback(({ address, confirmed, direction, paginator }: RecordRequestParams) => {
    const bridge = getBridge<EthereumDVMBridgeConfig>(direction);
    const api = bridge.config.api.dapp;

    return rxGet<E2DOriginRes>({
      url: apiUrl(api, DarwiniaApiPath.tokenLock),
      params: { sender: address, ...paginator, confirmed },
    }).pipe(
      map((res) => (res ? { ...res, list: res.list.map((item) => camelCaseKeys(item)) } : { count: 0, list: [] })),
      catchError((err) => {
        console.error(
          '%c [ e2dvm cross chain api request error: ]',
          'font-size:13px; background:pink; color:#bf2c9f;',
          err
        );
        return of(null);
      }),
      filter((res) => !!res)
    ) as NonNullable<Observable<E2DMappingRes>>;
  }, []);

  return {
    fetchIssuingRecords,
    fetchRedeemRecords,
  };
}
