import { DarwiniaApiPath } from 'shared/config/api';
import { ChainConfig, ICamelCaseKeys } from 'shared/model';
import { apiUrl, buf2hex, getBridge, rxGet } from 'shared/utils';
import { decodeAddress } from '@polkadot/util-crypto';
import camelCaseKeys from 'camelcase-keys';
import { useCallback } from 'react';
import { catchError, filter, map, Observable, of } from 'rxjs';
import { RecordsHooksResult, RecordList, FetchRecords, RecordRequestParams } from '../../../model';
import {
  Darwinia2EthereumHistoryRes,
  Darwinia2EthereumRecord,
  Ethereum2DarwiniaRedeemHistoryRes,
  Ethereum2DarwiniaRedeemRecord,
  Ethereum2DarwiniaRingBurnHistoryRes,
  Ethereum2DarwiniaRingBurnRecord,
  EthereumDarwiniaBridgeConfig,
} from '../model';

export function useRecords(
  _: ChainConfig,
  _2: ChainConfig
): RecordsHooksResult<
  RecordList<ICamelCaseKeys<Darwinia2EthereumRecord> | ICamelCaseKeys<Ethereum2DarwiniaRedeemRecord>>
> & {
  fetchGenesisRecords: FetchRecords<
    Ethereum2DarwiniaRingBurnHistoryRes<ICamelCaseKeys<Ethereum2DarwiniaRingBurnRecord>>,
    RecordRequestParams
  >;
} {
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

  const fetchGenesisRecords = useCallback(({ address, confirmed, direction, paginator }: RecordRequestParams) => {
    const bridge = getBridge<EthereumDarwiniaBridgeConfig>(direction);
    const api = bridge.config.api.dapp;

    return rxGet<Ethereum2DarwiniaRingBurnHistoryRes & { isGenesis: boolean }>({
      url: apiUrl(api, DarwiniaApiPath.ringBurn),
      params: { address, confirmed, ...paginator },
    }).pipe(
      map((res) => ({
        count: res?.count ?? 0,
        list: (res?.list ?? []).map((item) => camelCaseKeys({ ...item, isGenesis: true })),
      })),
      catchError((err) => {
        console.error('%c [ genesis api request error: ]', 'font-size:13px; background:pink; color:#bf2c9f;', err);
        return of(null);
      })
    ) as NonNullable<Observable<Ethereum2DarwiniaRingBurnHistoryRes<ICamelCaseKeys<Ethereum2DarwiniaRingBurnRecord>>>>;
  }, []);

  return {
    fetchRedeemRecords,
    fetchIssuingRecords,
    fetchGenesisRecords,
  };
}
