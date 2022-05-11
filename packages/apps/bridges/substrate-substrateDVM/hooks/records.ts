import { SHORT_DURATION } from 'shared/config/constant';
import { ChainConfig } from 'shared/model';
import { convertToDvm, pollWhile } from 'shared/utils/helper';
import { isHex } from '@polkadot/util';
import { message } from 'antd';
import camelCaseKeys from 'camelcase-keys';
import { getUnixTime } from 'date-fns';
import { FetchData, GraphQLClient, useManualQuery } from 'graphql-hooks';
import { isBoolean } from 'lodash';
import { Dispatch, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { catchError, EMPTY, from, map, Observable, of, switchMap, tap } from 'rxjs';
import Web3 from 'web3';
import { BridgeDispatchEventRecord, RecordList, RecordRequestParams, RecordsHooksResult } from '../../../model';
import {
  BRIDGE_DISPATCH_EVENTS,
  S2S_ISSUING_RECORDS_QUERY,
  S2S_ISSUING_RECORD_QUERY,
  S2S_REDEEM_RECORDS_QUERY,
  S2S_REDEEM_RECORD_QUERY,
} from '../config';
import {
  BridgeDispatchEventRes,
  Substrate2SubstrateDVMRecord,
  Substrate2SubstrateDVMRecordRes,
  Substrate2SubstrateDVMRecordsRes,
  SubstrateDVM2SubstrateRecord,
  SubstrateDVM2SubstrateRecordRes,
  SubstrateDVM2SubstrateRecordsRes,
} from '../model';

enum S2SRecordResult {
  locked,
  lockConfirmedSuccess,
  lockConfirmedFail,
}

const UNKNOWN_CLIENT = 'unknown';

interface FetchRecordOptions<T> {
  attemptsCount?: number;
  keepActive?: (res: T) => boolean;
  skipCache?: boolean;
}

type FetchS2SRecord<T, R> = (laneId: string, nonce: string, options: FetchRecordOptions<T>) => Observable<R>;

export function useRecords(
  departure: ChainConfig,
  arrival: ChainConfig
): RecordsHooksResult<RecordList<Substrate2SubstrateDVMRecord>> & {
  fetchIssuingRecord: FetchS2SRecord<Substrate2SubstrateDVMRecordRes, Substrate2SubstrateDVMRecord>;
  fetchRedeemRecord: FetchS2SRecord<SubstrateDVM2SubstrateRecordRes, Substrate2SubstrateDVMRecord>;
  fetchMessageEvent: FetchS2SRecord<BridgeDispatchEventRes, BridgeDispatchEventRecord>;
} {
  // const api = useMemo(
  //   () => getBridge<SubstrateSubstrateDVMBridgeConfig>([departure, arrival]).config.api,
  //   [departure, arrival]
  // );

  // TODO: apollo api;
  const subql = '';
  const thegraph = '';

  const issuingClient = useMemo(
    () => new GraphQLClient({ url: `${subql}${departure.name}` || UNKNOWN_CLIENT }),
    [departure.name]
  );

  const issuingTargetClient = useMemo(
    () => new GraphQLClient({ url: `${subql}${arrival.name}` || UNKNOWN_CLIENT }),
    [arrival.name]
  );

  const redeemClient = useMemo(() => new GraphQLClient({ url: thegraph || UNKNOWN_CLIENT }), [thegraph]);
  const { t } = useTranslation();

  // s2s issuing
  const [fetchIssuingRecords] = useManualQuery<Substrate2SubstrateDVMRecordsRes>(S2S_ISSUING_RECORDS_QUERY, {
    skipCache: true,
    client: issuingClient,
  });

  const [fetchIssuingRecord] = useManualQuery<Substrate2SubstrateDVMRecordRes>(S2S_ISSUING_RECORD_QUERY, {
    skipCache: true,
    client: issuingClient,
  });

  // s2s redeem, departure pangolin-smart
  const [fetchBurnRecords] = useManualQuery<SubstrateDVM2SubstrateRecordsRes>(S2S_REDEEM_RECORDS_QUERY, {
    skipCache: true,
    client: redeemClient,
  });

  const [fetchBurnRecord] = useManualQuery<SubstrateDVM2SubstrateRecordRes>(S2S_REDEEM_RECORD_QUERY, {
    skipCache: true,
    client: redeemClient,
  });

  const [fetchDispatchEvent] = useManualQuery<BridgeDispatchEventRes>(BRIDGE_DISPATCH_EVENTS, {
    skipCache: true,
    client: issuingTargetClient,
  });

  const [issuingMemo, setIssuingMemo] = useState<Record<string, Substrate2SubstrateDVMRecord>>({});
  const [burnMemo, setBurnMemo] = useState<Record<string, Substrate2SubstrateDVMRecord>>({});

  const toQueryVariables = useCallback((req: RecordRequestParams) => {
    const {
      address,
      paginator: { row: limit, page: offset },
      confirmed,
    } = req;
    const account = isHex(address) ? address : convertToDvm(address);

    const result = isBoolean(confirmed)
      ? confirmed
        ? [S2SRecordResult.lockConfirmedSuccess, S2SRecordResult.lockConfirmedFail]
        : [S2SRecordResult.locked]
      : [S2SRecordResult.locked, S2SRecordResult.lockConfirmedSuccess, S2SRecordResult.lockConfirmedFail];

    return { account, limit, offset: offset * limit, result };
  }, []);

  const fetchS2SIssuingRecords = useCallback(
    (req: RecordRequestParams) =>
      from(
        fetchIssuingRecords({
          variables: toQueryVariables(req),
        })
      ).pipe(
        map((res) => {
          const { totalCount = 0, nodes = [] } = res.data?.s2sEvents ?? {};
          const list = nodes.map(({ startTimestamp, endTimestamp, ...rest }) => ({
            ...rest,
            startTimestamp: startTimestamp && getUnixTime(new Date(startTimestamp)).toString(),
            endTimestamp: endTimestamp && getUnixTime(new Date(endTimestamp)).toString(),
          }));

          return { count: totalCount, list };
        }),
        catchError(() => {
          message.error(t('Querying failed, please try it again later'));
          return of({ count: 0, list: [] });
        })
      ),
    [fetchIssuingRecords, t, toQueryVariables]
  );

  const fetchS2SRedeemRecords = useCallback(
    (req: RecordRequestParams) =>
      from(fetchBurnRecords({ variables: toQueryVariables(req) })).pipe(
        map((res) => {
          const list = res.data?.burnRecordEntities ?? [];
          const {
            paginator: { row, page },
          } = req;
          let count = list.length;

          /**
           * @see https://github.com/graphprotocol/graph-node/issues/1309
           * TODO: At redeem side, subgraph does not support total count field in graphql response, limit and offset parameters are hardcoded.
           * The count is not accurate
           */
          if (count < row) {
            count = page * row + count;
          } else {
            count = (page + 1) * row + count;
          }

          return {
            count,
            list: list.map((item) => {
              const {
                requestTransaction: requestTxHash,
                responseTransaction: responseTxHash,
                sender,
                ...rest
              } = camelCaseKeys(item);

              return { ...rest, senderId: sender, requestTxHash, responseTxHash };
            }),
          };
        }),
        catchError(() => {
          message.error(t('Querying failed, please try it again later'));
          return of({ count: 0, list: [] });
        })
      ),
    [fetchBurnRecords, t, toQueryVariables]
  );

  const fetchRecord = useCallback(
    (
      id: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetch: FetchData<any>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { skipCache, attemptsCount, keepActive }: Required<FetchRecordOptions<any>>,
      memo: Record<string, Substrate2SubstrateDVMRecord>,
      updateMemo: Dispatch<React.SetStateAction<Record<string, Substrate2SubstrateDVMRecord>>>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recordMapper: (res: any) => Substrate2SubstrateDVMRecord
    ) => {
      if (!skipCache && memo[id]) {
        return of(memo[id]);
      }

      return of(null).pipe(
        switchMap(() => from(fetch({ variables: { id } }))),
        pollWhile(SHORT_DURATION, keepActive, attemptsCount, true),
        map((res) => recordMapper(res)),
        tap((record) => {
          updateMemo({ ...memo, [id]: record });
        }),
        catchError((error) => {
          console.info(
            `%c [ query record failed with message id: ${id} ]`,
            'font-size:13px; background:pink; color:#bf2c9f;',
            error.message
          );
          return EMPTY;
        })
      );
    },
    []
  );

  const fetchS2SIssuingRecord = useCallback<
    FetchS2SRecord<Substrate2SubstrateDVMRecordRes, Substrate2SubstrateDVMRecord>
  >(
    (
      laneId: string,
      nonce: string,
      { attemptsCount = Infinity, skipCache = false, keepActive = (res) => !res.s2sEvent }
    ) => {
      return fetchRecord(
        laneId + Web3.utils.toHex(nonce),
        fetchIssuingRecord,
        { skipCache, attemptsCount, keepActive: (res) => !res.data || keepActive(res.data) },
        issuingMemo,
        setIssuingMemo,
        (res) => res.data.s2sEvent
      );
    },
    [fetchIssuingRecord, fetchRecord, issuingMemo]
  );

  const fetchS2SRedeemRecord = useCallback<
    FetchS2SRecord<SubstrateDVM2SubstrateRecordRes, Substrate2SubstrateDVMRecord>
  >(
    (
      laneId: string,
      nonce: string,
      { attemptsCount = Infinity, skipCache = false, keepActive: keepActive = (res) => !res.burnRecordEntity }
    ) => {
      return fetchRecord(
        laneId + Web3.utils.toHex(nonce),
        fetchBurnRecord,
        { skipCache, attemptsCount, keepActive: (res) => !res.data || keepActive(res.data) },
        burnMemo,
        setBurnMemo,
        (res) => {
          const {
            responseTransaction: responseTxHash,
            requestTransaction: requestTxHash,
            sender,
            ...rest
          } = camelCaseKeys(res.data!.burnRecordEntity as unknown as SubstrateDVM2SubstrateRecord);

          return { ...rest, senderId: sender, responseTxHash, requestTxHash };
        }
      );
    },
    [burnMemo, fetchBurnRecord, fetchRecord]
  );

  const fetchMessageEvent = useCallback<FetchS2SRecord<BridgeDispatchEventRes, BridgeDispatchEventRecord>>(
    (laneId: string, nonce: string, { attemptsCount = Infinity }) => {
      return of(null).pipe(
        switchMap(() => from(fetchDispatchEvent({ variables: { id: `${laneId}${Web3.utils.toHex(nonce)}` } }))),
        pollWhile(SHORT_DURATION, (res) => !res.data?.bridgeDispatchEvent, attemptsCount, true),
        map((res) => {
          const { method, data, ...rest } = res.data!.bridgeDispatchEvent;

          if (method === 'MessageDispatched') {
            const detail = JSON.parse(data || '[]');
            const resultPosition = 2;

            return {
              ...rest,
              method,
              data,
              isSuccess: !(detail[resultPosition] as Record<string, string[]>).ok?.length,
            };
          }

          return { ...rest, method, data, isSuccess: false };
        }),
        catchError((error) => {
          console.info(
            `%c [ query record failed with laneId ${laneId}, nonce ${nonce} ]`,
            'font-size:13px; background:pink; color:#bf2c9f;',
            error.message
          );
          return EMPTY;
        })
      );
    },
    [fetchDispatchEvent]
  );

  return {
    fetchIssuingRecords: fetchS2SIssuingRecords,
    fetchRedeemRecords: fetchS2SRedeemRecords,
    fetchRedeemRecord: fetchS2SRedeemRecord,
    fetchIssuingRecord: fetchS2SIssuingRecord,
    fetchMessageEvent,
  };
}
