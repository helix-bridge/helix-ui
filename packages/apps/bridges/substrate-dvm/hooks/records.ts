import { ChainConfig, PolkadotChainConfig } from 'shared/model';
import { convertToDvm, convertToSS58 } from 'shared/utils/helper';
import { FetchData, GraphQLClient, useManualQuery } from 'graphql-hooks';
import { useCallback, useMemo } from 'react';
import { catchError, EMPTY, from, map } from 'rxjs';
import { RecordList, RecordRequestParams, RecordsHooksResult } from '../../../model';
import { DVM_TO_SUBSTRATE_QUERY, SUBSTRATE_TO_DVM_QUERY } from '../config';
import { DVM2SubstrateRecordsRes, Substrate2DVMRecord, Substrate2DVMRecordsRes } from '../model';

const UNKNOWN_CLIENT = 'unknown';

export function useRecords(
  departure: ChainConfig,
  arrival: ChainConfig
): RecordsHooksResult<RecordList<Substrate2DVMRecord>, Omit<RecordRequestParams, 'confirmed'>> {
  const subql = '';

  const issuingClient = useMemo(
    () => new GraphQLClient({ url: `${subql}${departure.name}` || UNKNOWN_CLIENT }),
    [departure.name]
  );

  const redeemClient = useMemo(
    () => new GraphQLClient({ url: `${subql}${arrival.name}` || UNKNOWN_CLIENT }),
    [arrival.name]
  );

  const [fetchIssuingRecords] = useManualQuery<Substrate2DVMRecordsRes>(SUBSTRATE_TO_DVM_QUERY, {
    skipCache: true,
    client: issuingClient,
  });

  const [fetchRedeemRecords] = useManualQuery<DVM2SubstrateRecordsRes>(DVM_TO_SUBSTRATE_QUERY, {
    skipCache: true,
    client: redeemClient,
  });

  const ss58Prefix = useMemo(() => (departure as PolkadotChainConfig).ss58Prefix, [departure]);

  const fetchRecords = useCallback(
    (
      req: Omit<RecordRequestParams, 'confirmed'>,
      fetch: FetchData<Substrate2DVMRecordsRes, Record<string, unknown>, unknown>,
      extra: { method?: string; account: string }
    ) => {
      const {
        paginator: { row, page },
      } = req;

      return from(
        fetch({
          variables: { limit: row, offset: page * row, ...extra },
          skipCache: true,
        })
      ).pipe(
        map((res) => {
          const { totalCount = 0, nodes = [] } = res.data?.transfers ?? {};

          return { count: totalCount, list: nodes };
        }),
        catchError(() => EMPTY)
      );
    },
    []
  );

  const fetchSubstrate2DVMRecords = useCallback(
    (req: Omit<RecordRequestParams, 'confirmed'>) =>
      fetchRecords(req, fetchIssuingRecords, {
        method: 'Transfer',
        account: convertToDvm(convertToSS58(req.address, ss58Prefix)),
      }),
    [ss58Prefix, fetchIssuingRecords, fetchRecords]
  );

  const fetchDVM2SubstrateRecords = useCallback(
    (req: Omit<RecordRequestParams, 'confirmed'>) =>
      fetchRecords(req, fetchRedeemRecords, { account: req.address.toLocaleLowerCase() }),
    [fetchRecords, fetchRedeemRecords]
  );

  return {
    fetchRedeemRecords: fetchDVM2SubstrateRecords,
    fetchIssuingRecords: fetchSubstrate2DVMRecords,
  };
}
